import SwiftUI

@main
struct ParityGeneratedApp: App {
    var body: some Scene {
        WindowGroup { RootView() }
    }
}

struct RootView: View {
    @State private var tab = "home"
    @State private var openItem: Int?

    var body: some View {
        VStack(spacing: 0) {
            Group {
                switch tab {
                case "browse": BrowseScreen(openItem: $openItem)
                case "account": AccountScreen()
                default: HomeScreen(
                    openBrowse: { openItem = nil; tab = "browse" },
                    openItem: { index in openItem = index; tab = "browse" }
                )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            ParityTabBar(selected: Binding(get: { tab }, set: { openItem = nil; tab = $0 }))
        }
        .background(Brand.surface.ignoresSafeArea())
        .preferredColorScheme(.light)
    }
}

struct HomeScreen: View {
    let openBrowse: () -> Void
    let openItem: (Int) -> Void
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                TopBar(id: "home.topbar", title: Brand.name, subtitle: Content.greeting)
                HeroBanner(id: "home.hero", hero: Content.hero, action: openBrowse)
                HStack(spacing: 12) {
                    ForEach(Array(Content.stats.enumerated()), id: \.offset) { index, stat in
                        StatTile(id: "home.stat.\(index)", stat: stat)
                    }
                }
                .padding(.horizontal, 20)
                SectionHeader(id: "home.section", title: Content.sectionTitle)
                ForEach(0..<2, id: \.self) { index in
                    ItemCard(id: "home.card.\(index)", item: Content.items[index]) { openItem(index) }
                }
            }
            .padding(.bottom, 16)
        }
    }
}

struct BrowseScreen: View {
    @Binding var openItem: Int?
    @State private var query = ""

    var body: some View {
        if let index = openItem {
            DetailScreen(item: Content.items[index], onBack: { openItem = nil })
                .transition(.move(edge: .trailing))
        } else {
            VStack(spacing: 12) {
                SectionHeader(id: "browse.title", title: Content.tabs[1].title)
                    .padding(.top, 12)
                SearchField(id: "browse.search", placeholder: Content.searchPlaceholder, text: $query)
                ScrollView {
                    VStack(spacing: 1) {
                        ForEach(Array(Content.items.enumerated()), id: \.offset) { index, item in
                            if query.isEmpty || item.title.localizedCaseInsensitiveContains(query) {
                                ListRow(id: "browse.row.\(index)", item: item) {
                                    withAnimation(.easeOut(duration: 0.2)) { openItem = index }
                                }
                            }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

struct DetailScreen: View {
    let item: ItemContent
    let onBack: () -> Void
    @State private var selected = 0
    @State private var confirmed = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Button(action: onBack) {
                    Label("Back", systemImage: "chevron.left")
                        .font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.primary)
                }
                .accessibilityIdentifier("detail.back")
                .padding(.horizontal, 20)
                .padding(.top, 8)
                DetailHeader(id: "detail.header", item: item)
                ValuePill(id: "detail.value", value: item.value).padding(.horizontal, 20)
                SectionHeader(id: "detail.options", title: Content.detail.optionsTitle)
                HStack(spacing: 10) {
                    ForEach(Array(Content.detail.options.enumerated()), id: \.offset) { index, option in
                        Chip(id: "detail.option.\(index)", title: option, selected: selected == index) { selected = index }
                    }
                }
                .padding(.horizontal, 20)
                PrimaryButton(id: "detail.primary", title: Content.detail.primaryAction) {
                    withAnimation { confirmed = true }
                }
                if confirmed {
                    ConfirmationBanner(id: "detail.confirmation", title: Content.detail.confirmation)
                }
            }
            .padding(.bottom, 16)
        }
    }
}

struct AccountScreen: View {
    @State private var toggleOn = false
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                SectionHeader(id: "account.title", title: Content.tabs[2].title).padding(.top, 12)
                ProfileHeader(id: "account.profile", name: Content.account.name, subtitle: Content.account.subtitle)
                VStack(spacing: 1) {
                    ForEach(Array(Content.account.rows.enumerated()), id: \.offset) { index, row in
                        SettingsRow(id: "account.row.\(index)", row: row)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal, 20)
                ToggleRow(id: "account.toggle", title: Content.account.toggle, isOn: $toggleOn)
            }
        }
    }
}
