import SwiftUI

// Shared component library. Every component carries the parity id from
// spec.json as its accessibilityIdentifier and the spec label as its
// accessibilityLabel; the Android twin uses the same ids as testTags.

struct BrandMark: View {
    var size: CGFloat = 36
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.28).fill(Brand.primary)
            Text(String(Brand.name.prefix(1)))
                .font(.system(size: size * 0.5, weight: .bold))
                .foregroundStyle(Brand.highlight)
        }
        .frame(width: size, height: size)
    }
}

struct TopBar: View {
    let id: String
    let title: String
    let subtitle: String
    var body: some View {
        HStack(spacing: 12) {
            BrandMark()
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 20, weight: .bold)).foregroundStyle(Brand.primary)
                Text(subtitle).font(.system(size: 13)).foregroundStyle(Brand.muted)
            }
            Spacer()
            Image(systemName: "bell.fill").font(.system(size: 18)).foregroundStyle(Brand.primary)
        }
        .padding(.horizontal, 20)
        .frame(height: 56)
        .contentShape(Rectangle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityIdentifier(id)
    }
}

struct HeroBanner: View {
    let id: String
    let hero: HeroContent
    let action: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(hero.eyebrow.uppercased())
                .font(.system(size: 11, weight: .semibold)).kerning(0.8)
                .foregroundStyle(Brand.highlight)
                .accessibilityHidden(true)
            Text(hero.title)
                .font(.system(size: 22, weight: .bold)).foregroundStyle(Brand.onPrimary)
                .accessibilityHidden(true)
            Text(hero.subtitle)
                .font(.system(size: 14)).foregroundStyle(Brand.onPrimary.opacity(0.85))
                .accessibilityHidden(true)
            Button(action: action) {
                Text(hero.cta)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Brand.primary)
                    .padding(.horizontal, 18).frame(height: 40)
                    .background(Capsule().fill(Brand.highlight))
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
            .accessibilityLabel(hero.cta)
            .accessibilityIdentifier("\(id).cta")
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 20).fill(Brand.primary))
        .padding(.horizontal, 20)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(hero.title)
        .accessibilityIdentifier(id)
    }
}

struct StatTile: View {
    let id: String
    let stat: StatContent
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: stat.icon).font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Brand.accent)
                .frame(width: 32, height: 32)
                .background(Circle().fill(Brand.accent.opacity(0.12)))
            VStack(alignment: .leading, spacing: 2) {
                Text(stat.value).font(.system(size: 16, weight: .bold)).foregroundStyle(Brand.ink)
                Text(stat.label).font(.system(size: 12)).foregroundStyle(Brand.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .frame(maxWidth: .infinity, minHeight: 64)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.white))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(stat.label): \(stat.value)")
        .accessibilityIdentifier(id)
    }
}

struct SectionHeader: View {
    let id: String
    let title: String
    var body: some View {
        Text(title)
            .font(.system(size: 17, weight: .bold)).foregroundStyle(Brand.ink)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .frame(height: 28)
            .contentShape(Rectangle())
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(title)
            .accessibilityIdentifier(id)
    }
}

struct IconTile: View {
    let icon: String
    var size: CGFloat = 44
    var body: some View {
        Image(systemName: icon)
            .font(.system(size: size * 0.42, weight: .semibold))
            .foregroundStyle(Brand.primary)
            .frame(width: size, height: size)
            .background(RoundedRectangle(cornerRadius: size * 0.27).fill(Brand.surface))
    }
}

struct Badge: View {
    let text: String
    var body: some View {
        Text(text).font(.system(size: 11, weight: .semibold))
            .foregroundStyle(Brand.accent)
            .padding(.horizontal, 8).frame(height: 20)
            .background(Capsule().fill(Brand.accent.opacity(0.12)))
    }
}

struct ItemCard: View {
    let id: String
    let item: ItemContent
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                IconTile(icon: item.icon)
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title).font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.ink)
                    Text(item.subtitle).font(.system(size: 13)).foregroundStyle(Brand.muted)
                }
                Spacer(minLength: 8)
                VStack(alignment: .trailing, spacing: 6) {
                    Badge(text: item.badge)
                    Text(item.value).font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.primary)
                }
            }
            .padding(14)
            .frame(height: 72)
            .background(RoundedRectangle(cornerRadius: 16).fill(Color.white))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 20)
        .accessibilityLabel(item.title)
        .accessibilityIdentifier(id)
    }
}

struct ListRow: View {
    let id: String
    let item: ItemContent
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                IconTile(icon: item.icon, size: 40)
                VStack(alignment: .leading, spacing: 3) {
                    Text(item.title).font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.ink)
                    Text(item.subtitle).font(.system(size: 13)).foregroundStyle(Brand.muted)
                }
                Spacer(minLength: 8)
                Text(item.value).font(.system(size: 13, weight: .semibold)).foregroundStyle(Brand.primary)
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundStyle(Brand.muted)
            }
            .padding(.horizontal, 20)
            .frame(height: 64)
            .background(Color.white)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(item.title)
        .accessibilityIdentifier(id)
    }
}

struct SearchField: View {
    let id: String
    let placeholder: String
    @Binding var text: String
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(Brand.muted)
            TextField(placeholder, text: $text)
                .font(.system(size: 15))
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .accessibilityLabel(placeholder)
                .accessibilityIdentifier(id)
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.white))
        .padding(.horizontal, 20)
    }
}

struct DetailHeader: View {
    let id: String
    let item: ItemContent
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            IconTile(icon: item.icon, size: 64)
            Badge(text: item.badge)
            Text(item.title).font(.system(size: 26, weight: .bold)).foregroundStyle(Brand.ink)
            Text(item.subtitle).font(.system(size: 15)).foregroundStyle(Brand.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
        .contentShape(Rectangle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(item.title)
        .accessibilityIdentifier(id)
    }
}

struct ValuePill: View {
    let id: String
    let value: String
    var body: some View {
        Text(value)
            .font(.system(size: 15, weight: .bold)).foregroundStyle(Brand.onPrimary)
            .padding(.horizontal, 14).frame(height: 32)
            .background(Capsule().fill(Brand.accent))
            .accessibilityLabel(value)
            .accessibilityIdentifier(id)
    }
}

struct Chip: View {
    let id: String
    let title: String
    let selected: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(selected ? Brand.onPrimary : Brand.primary)
                .frame(maxWidth: .infinity).frame(height: 44)
                .background(RoundedRectangle(cornerRadius: 12).fill(selected ? Brand.primary : Color.white))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Brand.primary.opacity(selected ? 0 : 0.25), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
        .accessibilityValue(selected ? "selected" : "unselected")
        .accessibilityAddTraits(selected ? .isSelected : [])
        .accessibilityIdentifier(id)
    }
}

struct PrimaryButton: View {
    let id: String
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 17, weight: .semibold)).foregroundStyle(Brand.onPrimary)
                .frame(maxWidth: .infinity).frame(height: 52)
                .background(Capsule().fill(Brand.primary))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 20)
        .accessibilityLabel(title)
        .accessibilityIdentifier(id)
    }
}

struct ConfirmationBanner: View {
    let id: String
    let title: String
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill").font(.system(size: 20)).foregroundStyle(Brand.success)
            Text(title).font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.ink)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16).frame(height: 52)
        .background(RoundedRectangle(cornerRadius: 14).fill(Brand.success.opacity(0.14)))
        .padding(.horizontal, 20)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityIdentifier(id)
    }
}

struct ProfileHeader: View {
    let id: String
    let name: String
    let subtitle: String
    var body: some View {
        HStack(spacing: 14) {
            Text(name.split(separator: " ").compactMap { $0.first }.map(String.init).joined())
                .font(.system(size: 22, weight: .bold)).foregroundStyle(Brand.onPrimary)
                .frame(width: 64, height: 64)
                .background(Circle().fill(Brand.primary))
            VStack(alignment: .leading, spacing: 4) {
                Text(name).font(.system(size: 20, weight: .bold)).foregroundStyle(Brand.ink)
                Text(subtitle).font(.system(size: 13)).foregroundStyle(Brand.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 18).fill(Color.white))
        .padding(.horizontal, 20)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(name)
        .accessibilityIdentifier(id)
    }
}

struct SettingsRow: View {
    let id: String
    let row: RowContent
    var body: some View {
        Button(action: {}) {
            HStack(spacing: 12) {
                Image(systemName: row.icon).font(.system(size: 16)).foregroundStyle(Brand.primary).frame(width: 28)
                Text(row.title).font(.system(size: 15)).foregroundStyle(Brand.ink)
                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundStyle(Brand.muted)
            }
            .padding(.horizontal, 16).frame(height: 52)
            .background(Color.white)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(row.title)
        .accessibilityIdentifier(id)
    }
}

struct ToggleRow: View {
    let id: String
    let title: String
    @Binding var isOn: Bool
    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(spacing: 12) {
                Image(systemName: "bell.fill").font(.system(size: 16)).foregroundStyle(Brand.primary).frame(width: 28)
                Text(title).font(.system(size: 15)).foregroundStyle(Brand.ink)
                Spacer()
                ZStack(alignment: isOn ? .trailing : .leading) {
                    Capsule().fill(isOn ? Brand.accent : Brand.muted.opacity(0.35)).frame(width: 50, height: 30)
                    Circle().fill(Color.white).frame(width: 26, height: 26).padding(2)
                }
                .animation(.easeInOut(duration: 0.15), value: isOn)
            }
            .padding(.horizontal, 16).frame(height: 56)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.white))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 20)
        .accessibilityLabel(title)
        .accessibilityValue(isOn ? "on" : "off")
        .accessibilityIdentifier(id)
    }
}

struct ParityTabBar: View {
    @Binding var selected: String
    var body: some View {
        HStack {
            ForEach(Content.tabs, id: \.id) { tab in
                Button(action: { selected = tab.id }) {
                    VStack(spacing: 4) {
                        Image(systemName: tab.icon).font(.system(size: 20))
                        Text(tab.title).font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundStyle(selected == tab.id ? Brand.primary : Brand.muted)
                    .frame(maxWidth: .infinity).frame(height: 56)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(tab.title)
                .accessibilityIdentifier("tab.\(tab.id)")
            }
        }
        .background(Color.white.shadow(.drop(color: .black.opacity(0.06), radius: 8, y: -2)))
    }
}
