package com.paritystudio.innodata

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ParityApp() {
    var tab by remember { mutableStateOf("home") }
    var openItem by remember { mutableStateOf<Int?>(null) }
    Column(Modifier.fillMaxSize().background(Brand.surface).systemBarsPadding()) {
        Box(Modifier.weight(1f).fillMaxWidth()) {
            when (tab) {
                "browse" -> BrowseScreen(openItem) { openItem = it }
                "account" -> AccountScreen()
                else -> HomeScreen(
                    openBrowse = { openItem = null; tab = "browse" },
                    openItem = { openItem = it; tab = "browse" },
                )
            }
        }
        ParityTabBar(tab) { openItem = null; tab = it }
    }
}

@Composable
fun HomeScreen(openBrowse: () -> Unit, openItem: (Int) -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        TopBar("home.topbar", Brand.name, Content.greeting)
        HeroBanner("home.hero", Content.hero, openBrowse)
        Row(Modifier.padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Content.stats.forEachIndexed { index, stat -> StatTile("home.stat.$index", stat, Modifier.weight(1f)) }
        }
        SectionHeader("home.section", Content.sectionTitle)
        for (index in 0 until 2) ItemCard("home.card.$index", Content.items[index]) { openItem(index) }
    }
}

@Composable
fun BrowseScreen(openItem: Int?, onOpen: (Int?) -> Unit) {
    if (openItem != null) {
        DetailScreen(Content.items[openItem]) { onOpen(null) }
        return
    }
    var query by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Spacer(Modifier.height(0.dp))
        SectionHeader("browse.title", Content.tabs[1].title)
        SearchField("browse.search", Content.searchPlaceholder, query) { query = it }
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).clip(RoundedCornerShape(16.dp)),
            verticalArrangement = Arrangement.spacedBy(1.dp),
        ) {
            Content.items.forEachIndexed { index, item ->
                if (query.isEmpty() || item.title.contains(query, ignoreCase = true)) {
                    ListRow("browse.row.$index", item) { onOpen(index) }
                }
            }
        }
    }
}

@Composable
fun DetailScreen(item: ItemContent, onBack: () -> Unit) {
    var selected by remember { mutableStateOf(0) }
    var confirmed by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Row(
            Modifier.padding(start = 20.dp, top = 8.dp).testTag("detail.back").clickable(onClick = onBack),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Filled.ArrowBack, contentDescription = null, tint = Brand.primary, modifier = Modifier.size(18.dp))
            Text("Back", color = Brand.primary, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        DetailHeader("detail.header", item)
        Box(Modifier.padding(horizontal = 20.dp)) { ValuePill("detail.value", item.value) }
        SectionHeader("detail.options", Content.detail.optionsTitle)
        Row(Modifier.padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Content.detail.options.forEachIndexed { index, option ->
                Chip("detail.option.$index", option, selected == index, Modifier.weight(1f)) { selected = index }
            }
        }
        PrimaryButton("detail.primary", Content.detail.primaryAction) { confirmed = true }
        if (confirmed) ConfirmationBanner("detail.confirmation", Content.detail.confirmation)
    }
}

@Composable
fun AccountScreen() {
    var toggleOn by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Spacer(Modifier.height(0.dp))
        SectionHeader("account.title", Content.tabs[2].title)
        ProfileHeader("account.profile", Content.account.name, Content.account.subtitle)
        Column(Modifier.padding(horizontal = 20.dp).clip(RoundedCornerShape(16.dp)), verticalArrangement = Arrangement.spacedBy(1.dp)) {
            Content.account.rows.forEachIndexed { index, row -> SettingsRow("account.row.$index", row) }
        }
        ToggleRow("account.toggle", Content.account.toggle, toggleOn) { toggleOn = !toggleOn }
    }
}
