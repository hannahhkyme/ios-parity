package __PACKAGE__

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Shared component library. Each component's testTag is the parity id from
// spec.json and its contentDescription is the spec label, mirroring the
// accessibilityIdentifier / accessibilityLabel pair on iOS.

private fun Modifier.parity(id: String, label: String, value: String? = null) =
    this.testTag(id).semantics {
        contentDescription = label
        if (value != null) stateDescription = value
    }

private fun Modifier.parityLeaf(id: String, label: String) =
    this.testTag(id).clearAndSetSemantics { contentDescription = label }

@Composable
fun BrandMark(size: Dp = 36.dp) {
    Box(Modifier.size(size).background(Brand.primary, RoundedCornerShape(size * 0.28f)), contentAlignment = Alignment.Center) {
        Text(Brand.name.take(1), color = Brand.highlight, fontSize = (size.value * 0.5f).sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun TopBar(id: String, title: String, subtitle: String) {
    Row(
        Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 20.dp).parityLeaf(id, title),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        BrandMark()
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, color = Brand.primary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = Brand.muted, fontSize = 13.sp)
        }
        Icon(Icons.Filled.Notifications, null, tint = Brand.primary, modifier = Modifier.size(20.dp))
    }
}

@Composable
fun HeroBanner(id: String, hero: HeroContent, action: () -> Unit) {
    Column(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth()
            .background(Brand.primary, RoundedCornerShape(20.dp)).padding(18.dp)
            .parity(id, hero.title),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(hero.eyebrow.uppercase(), color = Brand.highlight, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.8.sp, modifier = Modifier.clearAndSetSemantics {})
        Text(hero.title, color = Brand.onPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clearAndSetSemantics {})
        Text(hero.subtitle, color = Brand.onPrimary.copy(alpha = 0.85f), fontSize = 14.sp, modifier = Modifier.clearAndSetSemantics {})
        Box(
            Modifier.padding(top = 4.dp).height(40.dp).background(Brand.highlight, CircleShape)
                .parity("$id.cta", hero.cta).clickable(onClick = action).padding(horizontal = 18.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(hero.cta, color = Brand.primary, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun StatTile(id: String, stat: StatContent, modifier: Modifier = Modifier) {
    Row(
        modifier.heightIn(min = 64.dp).background(Color.White, RoundedCornerShape(14.dp)).padding(12.dp)
            .parityLeaf(id, "${stat.label}: ${stat.value}"),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(Modifier.size(32.dp).background(Brand.accent.copy(alpha = 0.12f), CircleShape), contentAlignment = Alignment.Center) {
            Icon(stat.icon, null, tint = Brand.accent, modifier = Modifier.size(16.dp))
        }
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(stat.value, color = Brand.ink, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Text(stat.label, color = Brand.muted, fontSize = 12.sp)
        }
    }
}

@Composable
fun SectionHeader(id: String, title: String) {
    Text(
        title, color = Brand.ink, fontSize = 17.sp, fontWeight = FontWeight.Bold,
        modifier = Modifier.fillMaxWidth().height(28.dp).padding(horizontal = 20.dp).wrapContentHeight(Alignment.CenterVertically).parityLeaf(id, title),
    )
}

@Composable
fun IconTile(icon: ImageVector, size: Dp = 44.dp) {
    Box(Modifier.size(size).background(Brand.surface, RoundedCornerShape(size * 0.27f)), contentAlignment = Alignment.Center) {
        Icon(icon, null, tint = Brand.primary, modifier = Modifier.size(size * 0.45f))
    }
}

@Composable
fun Badge(text: String) {
    Box(Modifier.height(20.dp).background(Brand.accent.copy(alpha = 0.12f), CircleShape).padding(horizontal = 8.dp), contentAlignment = Alignment.Center) {
        Text(text, color = Brand.accent, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun ItemCard(id: String, item: ItemContent, action: () -> Unit) {
    Row(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(72.dp)
            .background(Color.White, RoundedCornerShape(16.dp))
            .parity(id, item.title).clickable(onClick = action).padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        IconTile(item.icon)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(item.title, color = Brand.ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Text(item.subtitle, color = Brand.muted, fontSize = 13.sp)
        }
        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Badge(item.badge)
            Text(item.value, color = Brand.primary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun ListRow(id: String, item: ItemContent, action: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().height(64.dp).background(Color.White)
            .parity(id, item.title).clickable(onClick = action).padding(horizontal = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        IconTile(item.icon, 40.dp)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(item.title, color = Brand.ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Text(item.subtitle, color = Brand.muted, fontSize = 13.sp)
        }
        Text(item.value, color = Brand.primary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Icon(Icons.Filled.KeyboardArrowRight, null, tint = Brand.muted, modifier = Modifier.size(18.dp))
    }
}

@Composable
fun SearchField(id: String, placeholder: String, text: String, onChange: (String) -> Unit) {
    Row(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(44.dp)
            .background(Color.White, RoundedCornerShape(12.dp)).padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(Icons.Filled.Search, null, tint = Brand.muted, modifier = Modifier.size(18.dp))
        Box(Modifier.weight(1f)) {
            if (text.isEmpty()) Text(placeholder, color = Brand.muted.copy(alpha = 0.7f), fontSize = 15.sp, modifier = Modifier.clearAndSetSemantics {})
            BasicTextField(
                value = text, onValueChange = onChange, singleLine = true,
                textStyle = TextStyle(color = Brand.ink, fontSize = 15.sp),
                modifier = Modifier.fillMaxWidth().parity(id, placeholder),
            )
        }
    }
}

@Composable
fun DetailHeader(id: String, item: ItemContent) {
    Column(Modifier.padding(horizontal = 20.dp).fillMaxWidth().parityLeaf(id, item.title), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        IconTile(item.icon, 64.dp)
        Badge(item.badge)
        Text(item.title, color = Brand.ink, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(item.subtitle, color = Brand.muted, fontSize = 15.sp)
    }
}

@Composable
fun ValuePill(id: String, value: String) {
    Box(Modifier.height(32.dp).background(Brand.accent, CircleShape).padding(horizontal = 14.dp).parityLeaf(id, value), contentAlignment = Alignment.Center) {
        Text(value, color = Brand.onPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun Chip(id: String, title: String, selected: Boolean, modifier: Modifier = Modifier, action: () -> Unit) {
    Box(
        modifier.height(44.dp)
            .background(if (selected) Brand.primary else Color.White, RoundedCornerShape(12.dp))
            .border(1.dp, Brand.primary.copy(alpha = if (selected) 0f else 0.25f), RoundedCornerShape(12.dp))
            .parity(id, title, if (selected) "selected" else "unselected")
            .semantics { this.selected = selected }
            .clickable(onClick = action),
        contentAlignment = Alignment.Center,
    ) {
        Text(title, color = if (selected) Brand.onPrimary else Brand.primary, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun PrimaryButton(id: String, title: String, action: () -> Unit) {
    Box(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(52.dp)
            .background(Brand.primary, CircleShape).parity(id, title).clickable(onClick = action),
        contentAlignment = Alignment.Center,
    ) {
        Text(title, color = Brand.onPrimary, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun ConfirmationBanner(id: String, title: String) {
    Row(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(52.dp)
            .background(Brand.success.copy(alpha = 0.14f), RoundedCornerShape(14.dp)).padding(horizontal = 16.dp)
            .parityLeaf(id, title),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Icon(Icons.Filled.CheckCircle, null, tint = Brand.success, modifier = Modifier.size(22.dp))
        Text(title, color = Brand.ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun ProfileHeader(id: String, name: String, subtitle: String) {
    Row(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().background(Color.White, RoundedCornerShape(18.dp)).padding(16.dp)
            .parityLeaf(id, name),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(Modifier.size(64.dp).background(Brand.primary, CircleShape), contentAlignment = Alignment.Center) {
            Text(name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.joinToString(""), color = Brand.onPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(name, color = Brand.ink, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = Brand.muted, fontSize = 13.sp)
        }
    }
}

@Composable
fun SettingsRow(id: String, row: RowContent) {
    Row(
        Modifier.fillMaxWidth().height(52.dp).background(Color.White).parity(id, row.title).clickable {}.padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(row.icon, null, tint = Brand.primary, modifier = Modifier.width(28.dp).height(18.dp))
        Text(row.title, color = Brand.ink, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Icon(Icons.Filled.KeyboardArrowRight, null, tint = Brand.muted, modifier = Modifier.size(18.dp))
    }
}

@Composable
fun ToggleRow(id: String, title: String, isOn: Boolean, onToggle: () -> Unit) {
    val knob by animateDpAsState(if (isOn) 22.dp else 2.dp, label = "knob")
    Row(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().height(56.dp)
            .background(Color.White, RoundedCornerShape(14.dp))
            .parity(id, title, if (isOn) "on" else "off").clickable(onClick = onToggle).padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(Icons.Filled.Notifications, null, tint = Brand.primary, modifier = Modifier.width(28.dp).height(18.dp))
        Text(title, color = Brand.ink, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Box(Modifier.width(50.dp).height(30.dp).background(if (isOn) Brand.accent else Brand.muted.copy(alpha = 0.35f), CircleShape)) {
            Box(Modifier.padding(start = knob, top = 2.dp).size(26.dp).background(Color.White, CircleShape))
        }
    }
}

@Composable
fun ParityTabBar(selected: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().shadow(8.dp).background(Color.White)) {
        Content.tabs.forEach { tab ->
            val tint = if (selected == tab.id) Brand.primary else Brand.muted
            Column(
                Modifier.weight(1f).height(56.dp).parity("tab.${tab.id}", tab.title).clickable { onSelect(tab.id) },
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Icon(tab.icon, null, tint = tint, modifier = Modifier.size(22.dp))
                Text(tab.title, color = tint, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
