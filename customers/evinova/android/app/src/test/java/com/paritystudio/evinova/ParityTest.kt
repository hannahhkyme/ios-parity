package com.paritystudio.evinova

import android.graphics.Bitmap
import android.graphics.Canvas
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsNode
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertTrue
import org.junit.FixMethodOrder
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.MethodSorters
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

// Generic parity runner: reads parity-spec.json (the same contract the iOS
// XCUITest runner reads), captures every component and runs every flow, then
// writes components.json / flows.json + PNGs to -Dparity.out.

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w402dp-h874dp-port-xxhdpi")
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class ParityTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    private val spec = JSONObject(javaClass.classLoader!!.getResourceAsStream("parity-spec.json").bufferedReader().readText())
    private val out = File(System.getProperty("parity.out") ?: "build/parity").apply {
        listOf("components", "screens", "frames").forEach { File(this, it).mkdirs() }
    }
    private var frameIndex = 0

    private fun relaunch() {
        rule.activityRule.scenario.recreate()
        rule.waitForIdle()
    }

    private fun nodes(id: String) = rule.onAllNodesWithTag(id).fetchSemanticsNodes()

    private fun label(n: SemanticsNode): String =
        n.config.getOrNull(SemanticsProperties.ContentDescription)?.joinToString(" ")
            ?: n.config.getOrNull(SemanticsProperties.Text)?.joinToString(" ") { it.text } ?: ""

    private fun value(n: SemanticsNode): String? =
        n.config.getOrNull(SemanticsProperties.StateDescription)
            ?: n.config.getOrNull(SemanticsProperties.EditableText)?.text

    private fun role(n: SemanticsNode) = when {
        n.config.contains(SemanticsActions.SetText) -> "input"
        n.config.contains(SemanticsActions.OnClick) -> "interactive"
        else -> "static"
    }

    private fun waitFor(ms: Long, cond: () -> Boolean): Boolean =
        try { rule.waitUntil(ms) { cond() }; true } catch (e: Throwable) { cond() }

    private fun perform(step: JSONObject): Pair<Boolean, String> {
        val target = step.getString("target")
        val expected = step.optString("value", "")
        return when (step.getString("action")) {
            "tap" -> if (!waitFor(5000) { nodes(target).isNotEmpty() }) false to "$target not found" else {
                rule.onNodeWithTag(target).performClick(); rule.waitForIdle(); true to "tapped $target"
            }
            "type" -> if (!waitFor(5000) { nodes(target).isNotEmpty() }) false to "$target not found" else {
                val text = step.optString("text", "")
                rule.onNodeWithTag(target).performClick()
                rule.onNodeWithTag(target).performTextInput(text); rule.waitForIdle(); true to "typed \"$text\""
            }
            "expectExists" -> waitFor(5000) { nodes(target).isNotEmpty() }.let { it to if (it) "$target shown" else "$target missing" }
            "expectMissing" -> waitFor(3000) { nodes(target).isEmpty() }.let { it to if (it) "$target hidden" else "$target still shown" }
            "expectLabel" -> {
                val ok = waitFor(5000) { nodes(target).firstOrNull()?.let(::label) == expected }
                ok to "label \"${nodes(target).firstOrNull()?.let(::label) ?: "-"}\" (expected \"$expected\")"
            }
            "expectValue" -> {
                val ok = waitFor(5000) { nodes(target).firstOrNull()?.let(::value) == expected }
                ok to "value \"${nodes(target).firstOrNull()?.let(::value) ?: "-"}\" (expected \"$expected\")"
            }
            else -> false to "unknown action"
        }
    }

    private fun capture(): Bitmap {
        rule.waitForIdle()
        lateinit var bmp: Bitmap
        rule.runOnUiThread {
            val v = rule.activity.window.decorView
            bmp = Bitmap.createBitmap(v.width, v.height, Bitmap.Config.ARGB_8888)
            v.draw(Canvas(bmp))
        }
        return bmp
    }

    private fun save(bmp: Bitmap, relative: String) =
        File(out, relative).outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }

    private fun density() = rule.activity.resources.displayMetrics.density

    private fun device(): JSONObject {
        val v = rule.activity.window.decorView
        return JSONObject()
            .put("platform", "android")
            .put("device", "Robolectric virtual device (402×874 dp, xxhdpi)")
            .put("os", "Android 14 (API 34)")
            .put("runner", "Robolectric + Compose UI Test")
            .put("width", v.width / density()).put("height", v.height / density()).put("unit", "dp")
    }

    private fun steps(arr: JSONArray) = (0 until arr.length()).map { arr.getJSONObject(it) }

    @Test
    fun test1Components() {
        val results = JSONObject()
        val screens = JSONObject()
        val comps = steps(spec.getJSONArray("components"))
        var missing = 0
        for (screen in steps(spec.getJSONArray("screens"))) {
            relaunch()
            steps(screen.getJSONArray("route")).forEach { perform(it) }
            val shot = capture()
            val sid = screen.getString("id")
            save(shot, "screens/$sid.png")
            screens.put(sid, "screens/$sid.png")
            for (comp in comps.filter { it.getString("screen") == sid }) {
                val id = comp.getString("id")
                val n = nodes(id).firstOrNull()
                val entry = JSONObject().put("found", n != null)
                if (n != null) {
                    val b = n.boundsInWindow
                    val d = density()
                    entry.put("label", label(n)).put("value", value(n) ?: JSONObject.NULL).put("role", role(n))
                        .put("frame", JSONObject().put("x", b.left / d).put("y", b.top / d).put("w", b.width / d).put("h", b.height / d))
                    val x = b.left.toInt().coerceIn(0, shot.width - 1)
                    val y = b.top.toInt().coerceIn(0, shot.height - 1)
                    val w = b.width.toInt().coerceIn(1, shot.width - x)
                    val h = b.height.toInt().coerceIn(1, shot.height - y)
                    save(Bitmap.createBitmap(shot, x, y, w, h), "components/$id.png")
                    entry.put("image", "components/$id.png")
                } else missing++
                results.put(id, entry)
            }
        }
        File(out, "components.json").writeText(JSONObject().put("device", device()).put("components", results).put("screens", screens).toString(2))
        assertTrue("$missing components missing", missing == 0)
    }

    private fun frame(name: String) {
        frameIndex++
        save(capture(), "frames/%03d-%s.png".format(frameIndex, name))
    }

    @Test
    fun test2Flows() {
        val results = JSONObject()
        var failed = 0
        steps(spec.getJSONArray("flows")).forEachIndexed { index, flow ->
            // Switching tabs rebuilds every screen, so tapping Home resets state
            // between flows (same reset the iOS runner uses).
            if (index > 0) perform(JSONObject().put("action", "tap").put("target", "tab.home"))
            val fid = flow.getString("id")
            frame("$fid-start")
            val log = JSONArray()
            var passed = true
            steps(flow.getJSONArray("steps")).forEachIndexed { i, step ->
                val (ok, detail) = perform(step)
                passed = passed && ok
                log.put(JSONObject().put("action", step.getString("action")).put("target", step.getString("target")).put("ok", ok).put("detail", detail))
                frame("$fid-${i + 1}")
            }
            if (!passed) failed++
            results.put(fid, JSONObject().put("passed", passed).put("steps", log))
        }
        File(out, "flows.json").writeText(JSONObject().put("device", device()).put("flows", results).toString(2))
        assertTrue("$failed flows failed", failed == 0)
    }
}
