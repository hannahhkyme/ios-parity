// Industry profiles: the content a generated app shows, keyed by vertical.
// Every profile fills the same shape, so both platforms render the same
// screens and the parity contract (spec.json) stays identical in structure.

export const ICONS = {
  home: { ios: "house.fill", android: "Home" },
  calendar: { ios: "calendar", android: "DateRange" },
  list: { ios: "list.bullet", android: "List" },
  person: { ios: "person.crop.circle", android: "AccountCircle" },
  bag: { ios: "bag.fill", android: "ShoppingCart" },
  star: { ios: "star.fill", android: "Star" },
  bell: { ios: "bell.fill", android: "Notifications" },
  check: { ios: "checkmark.circle.fill", android: "CheckCircle" },
  heart: { ios: "heart.fill", android: "Favorite" },
  mail: { ios: "envelope.fill", android: "Email" },
  info: { ios: "info.circle.fill", android: "Info" },
  place: { ios: "mappin.circle.fill", android: "Place" },
  lock: { ios: "lock.fill", android: "Lock" },
  settings: { ios: "gearshape.fill", android: "Settings" },
  phone: { ios: "phone.fill", android: "Phone" },
  build: { ios: "wrench.and.screwdriver.fill", android: "Build" },
};

export const PROFILES = {
  clinical: (c) => ({
    tabs: [
      { id: "home", title: "Today", icon: "home" },
      { id: "browse", title: "Activities", icon: "list" },
      { id: "account", title: "Profile", icon: "person" },
    ],
    greeting: "Good morning, Maya",
    hero: {
      eyebrow: "Study ONC-2207 · Week 6",
      title: "Your Week 6 diary is ready",
      subtitle: "Takes about 4 minutes. Your site team sees it the same day.",
      cta: "Start diary",
    },
    stats: [
      { label: "Diary streak", value: "12 days", icon: "check" },
      { label: "Next visit", value: "Thu 9:30", icon: "calendar" },
    ],
    sectionTitle: "Up next",
    searchPlaceholder: "Search activities",
    items: [
      { title: "Daily symptom diary", subtitle: "eCOA · 4 min", value: "Due today", badge: "Required", icon: "list" },
      { title: "Week 6 site visit", subtitle: "Cambridge Research Site", value: "Thu 9:30", badge: "Visit", icon: "calendar" },
      { title: "Wearable sync", subtitle: "Activity tracker", value: "Synced", badge: "Device", icon: "heart" },
      { title: "Message from Dr. Patel", subtitle: "Study coordinator", value: "New", badge: "Inbox", icon: "mail" },
    ],
    detail: {
      optionsTitle: "How are you feeling today?",
      options: ["Better", "Same", "Worse"],
      primaryAction: "Submit entry",
      confirmation: "Entry sent to your site team",
    },
    account: {
      name: "Maya Thompson",
      subtitle: "Participant 0417 · ONC-2207",
      rows: [
        { title: "My study", icon: "info" },
        { title: "Consent documents", icon: "lock" },
        { title: "Contact site team", icon: "phone" },
      ],
      toggle: "Medication reminders",
    },
  }),
  retail: (c) => ({
    tabs: [
      { id: "home", title: "Home", icon: "home" },
      { id: "browse", title: "Shop", icon: "bag" },
      { id: "account", title: "Account", icon: "person" },
    ],
    greeting: "Hi, Jordan",
    hero: {
      eyebrow: "New season",
      title: `The ${c} holiday edit`,
      subtitle: "Cozy layers and gifts, with free pickup today.",
      cta: "Shop the edit",
    },
    stats: [
      { label: "Rewards", value: "1,240 pts", icon: "star" },
      { label: "Bag", value: "2 items", icon: "bag" },
    ],
    sectionTitle: "Trending now",
    searchPlaceholder: `Search ${c}`,
    items: [
      { title: "Cashsoft crewneck", subtitle: "Oatmeal heather", value: "$59.95", badge: "New", icon: "star" },
      { title: "High rise jeans", subtitle: "Dark indigo", value: "$79.95", badge: "Best seller", icon: "bag" },
      { title: "Puffer jacket", subtitle: "Recycled fill", value: "$129.00", badge: "Warm", icon: "heart" },
      { title: "Gift card", subtitle: "Digital delivery", value: "From $25", badge: "Gift", icon: "mail" },
    ],
    detail: {
      optionsTitle: "Size",
      options: ["S", "M", "L"],
      primaryAction: "Add to bag",
      confirmation: "Added to bag",
    },
    account: {
      name: "Jordan Lee",
      subtitle: "Rewards member since 2021",
      rows: [
        { title: "Orders & returns", icon: "list" },
        { title: "Saved addresses", icon: "place" },
        { title: "Payment methods", icon: "lock" },
      ],
      toggle: "Sale alerts",
    },
  }),
  banking: (c) => ({
    tabs: [
      { id: "home", title: "Home", icon: "home" },
      { id: "browse", title: "Accounts", icon: "list" },
      { id: "account", title: "Profile", icon: "person" },
    ],
    greeting: "Good morning, Alex",
    hero: {
      eyebrow: "Everyday account",
      title: "$4,218.40 available",
      subtitle: "Pay day lands Friday. Bills are covered.",
      cta: "Move money",
    },
    stats: [
      { label: "Spent this week", value: "$312", icon: "bag" },
      { label: "Savings goal", value: "68%", icon: "star" },
    ],
    sectionTitle: "Recent activity",
    searchPlaceholder: "Search transactions",
    items: [
      { title: "Everyday account", subtitle: "BSB 062-001 · 1234", value: "$4,218.40", badge: "Main", icon: "home" },
      { title: "Bonus saver", subtitle: "4.85% p.a.", value: "$18,902.11", badge: "Savings", icon: "star" },
      { title: "Platinum card", subtitle: "Due 28 Nov", value: "$1,120.55", badge: "Credit", icon: "lock" },
      { title: "Home loan", subtitle: "Offset linked", value: "$412,800", badge: "Loan", icon: "place" },
    ],
    detail: {
      optionsTitle: "Transfer amount",
      options: ["$50", "$100", "$250"],
      primaryAction: "Transfer now",
      confirmation: "Transfer scheduled",
    },
    account: {
      name: "Alex Morgan",
      subtitle: "Customer since 2015",
      rows: [
        { title: "Statements", icon: "list" },
        { title: "Card controls", icon: "lock" },
        { title: "Contact us", icon: "phone" },
      ],
      toggle: "Spending alerts",
    },
  }),
  travel: (c) => ({
    tabs: [
      { id: "home", title: "Trips", icon: "home" },
      { id: "browse", title: "Bookings", icon: "list" },
      { id: "account", title: "Profile", icon: "person" },
    ],
    greeting: "Welcome back, Sam",
    hero: {
      eyebrow: "Upcoming trip",
      title: "London → Frankfurt, Tue",
      subtitle: "LH 921 departs 07:40 from Terminal 2.",
      cta: "View boarding pass",
    },
    stats: [
      { label: "Trips this year", value: "14", icon: "place" },
      { label: "Pending approvals", value: "2", icon: "check" },
    ],
    sectionTitle: "Itinerary",
    searchPlaceholder: "Search bookings",
    items: [
      { title: "LH 921 to Frankfurt", subtitle: "Economy · Seat 14C", value: "07:40", badge: "Flight", icon: "place" },
      { title: "Hotel Frankfurter Hof", subtitle: "2 nights", value: "€410", badge: "Hotel", icon: "home" },
      { title: "Airport transfer", subtitle: "Pickup 18:10", value: "€48", badge: "Car", icon: "build" },
      { title: "Expense report", subtitle: "3 receipts", value: "Draft", badge: "Expense", icon: "list" },
    ],
    detail: {
      optionsTitle: "Seat preference",
      options: ["Window", "Aisle", "Any"],
      primaryAction: "Confirm booking",
      confirmation: "Booking confirmed",
    },
    account: {
      name: "Sam Becker",
      subtitle: "Travel policy: Standard",
      rows: [
        { title: "Travel documents", icon: "lock" },
        { title: "Loyalty programs", icon: "star" },
        { title: "Support", icon: "phone" },
      ],
      toggle: "Flight status alerts",
    },
  }),
  telecom: (c) => ({
    tabs: [
      { id: "home", title: "Home", icon: "home" },
      { id: "browse", title: "Tasks", icon: "list" },
      { id: "account", title: "Profile", icon: "person" },
    ],
    greeting: "Shift starts 08:00, Riley",
    hero: {
      eyebrow: "Today's route",
      title: "5 field tasks assigned",
      subtitle: "First stop: cell site CS-1182, 12 min away.",
      cta: "Start route",
    },
    stats: [
      { label: "Completed", value: "3 / 8", icon: "check" },
      { label: "SLA at risk", value: "1", icon: "bell" },
    ],
    sectionTitle: "Assigned to you",
    searchPlaceholder: "Search tasks",
    items: [
      { title: "Replace RRU at CS-1182", subtitle: "Priority P2", value: "08:30", badge: "Repair", icon: "build" },
      { title: "Fiber splice FX-207", subtitle: "Cabinet 14", value: "10:00", badge: "Install", icon: "place" },
      { title: "Battery audit BS-88", subtitle: "Preventive", value: "13:15", badge: "Audit", icon: "check" },
      { title: "Customer callback", subtitle: "Ticket 55120", value: "15:00", badge: "Call", icon: "phone" },
    ],
    detail: {
      optionsTitle: "Task status",
      options: ["En route", "On site", "Blocked"],
      primaryAction: "Save & complete",
      confirmation: "Task saved",
    },
    account: {
      name: "Riley Chen",
      subtitle: "Field technician · Region North",
      rows: [
        { title: "Certifications", icon: "star" },
        { title: "Vehicle & tools", icon: "build" },
        { title: "Dispatch desk", icon: "phone" },
      ],
      toggle: "Offline mode",
    },
  }),
  generic: (c) => ({
    tabs: [
      { id: "home", title: "Home", icon: "home" },
      { id: "browse", title: "Explore", icon: "list" },
      { id: "account", title: "Account", icon: "person" },
    ],
    greeting: "Welcome back",
    hero: {
      eyebrow: `${c} for iOS`,
      title: `Everything ${c}, in one app`,
      subtitle: "Pick up where you left off on any device.",
      cta: "Get started",
    },
    stats: [
      { label: "Open items", value: "3", icon: "list" },
      { label: "Updates", value: "5 new", icon: "bell" },
    ],
    sectionTitle: "For you",
    searchPlaceholder: `Search ${c}`,
    items: [
      { title: "Getting started guide", subtitle: "5 min read", value: "New", badge: "Guide", icon: "info" },
      { title: "Your dashboard", subtitle: "Updated today", value: "Live", badge: "Data", icon: "star" },
      { title: "Team workspace", subtitle: "4 members", value: "Active", badge: "Team", icon: "person" },
      { title: "Support center", subtitle: "24/7 help", value: "Open", badge: "Help", icon: "phone" },
    ],
    detail: {
      optionsTitle: "Choose a plan",
      options: ["Starter", "Pro", "Enterprise"],
      primaryAction: "Continue",
      confirmation: "You're all set",
    },
    account: {
      name: "Taylor Kim",
      subtitle: "Member since 2024",
      rows: [
        { title: "Preferences", icon: "settings" },
        { title: "Security", icon: "lock" },
        { title: "Help & support", icon: "phone" },
      ],
      toggle: "Notifications",
    },
  }),
};

// Known companies: industry + brand palette taken from their public sites.
export const PRESETS = {
  evinova: {
    displayName: "Evinova",
    industry: "clinical",
    tagline: "Clinical trials, designed around the participant",
    brand: { primary: "#3B0030", accent: "#ED4A73", highlight: "#FFCD00", surface: "#EFE3E9", onPrimary: "#FFFFFF" },
  },
  innodata: {
    displayName: "Innodata",
    industry: "generic",
    tagline: "Data and human expertise for building AI",
    brand: { primary: "#0170B9", accent: "#03588F", highlight: "#B5E5FF", surface: "#EAF4FA", onPrimary: "#FFFFFF" },
    content: {
      tabs: [
        { id: "home", title: "Home", icon: "home" },
        { id: "browse", title: "Solutions", icon: "list" },
        { id: "account", title: "Account", icon: "person" },
      ],
      greeting: "Welcome to Innodata",
      hero: {
        eyebrow: "AI DATA SOLUTIONS",
        title: "Build AI with better data",
        subtitle: "Explore training data, annotation and model evaluation services.",
        cta: "Explore solutions",
      },
      stats: [
        { label: "Data services", value: "2", icon: "list" },
        { label: "Platforms", value: "2", icon: "star" },
      ],
      sectionTitle: "AI data services",
      searchPlaceholder: "Search solutions",
      items: [
        { title: "Data Annotation", subtitle: "Label training datasets", value: "Labeling", badge: "AI Data", icon: "check" },
        { title: "Model Evaluation", subtitle: "Human feedback", value: "Evaluation", badge: "GenAI", icon: "star" },
        { title: "Synodex", subtitle: "Turn medical records into structured data", value: "Platform", badge: "Insurance", icon: "heart" },
        { title: "Agility PR", subtitle: "Monitor media coverage and reach journalists", value: "Platform", badge: "Media", icon: "mail" },
      ],
      detail: {
        optionsTitle: "Choose a data type",
        options: ["Text", "Images", "Audio"],
        primaryAction: "Save interest",
        confirmation: "Interest saved",
      },
      account: {
        name: "Demo account",
        subtitle: "Innodata solutions explorer",
        rows: [
          { title: "Preferences", icon: "settings" },
          { title: "Privacy", icon: "lock" },
          { title: "Help & support", icon: "phone" },
        ],
        toggle: "Solution updates",
      },
    },
  },
  fortitudefinancial: {
    displayName: "Fortitude Financial",
    industry: "banking",
    tagline: "Wealth management and financial planning in Spokane, WA",
    brand: { primary: "#0C3C54", accent: "#00549E", highlight: "#B9DEF4", surface: "#EDF4F7", onPrimary: "#FFFFFF" },
    content: {
      tabs: [
        { id: "home", title: "Home", icon: "home" },
        { id: "browse", title: "Services", icon: "list" },
        { id: "account", title: "Account", icon: "person" },
      ],
      greeting: "Welcome to Fortitude Financial",
      hero: {
        eyebrow: "SPOKANE, WA",
        title: "Plan for what matters",
        subtitle: "Explore financial planning and wealth management for your goals.",
        cta: "Explore services",
      },
      stats: [
        { label: "Core services", value: "4", icon: "list" },
        { label: "Office", value: "Spokane", icon: "place" },
      ],
      sectionTitle: "Featured services",
      searchPlaceholder: "Search services",
      items: [
        { title: "Financial Planning", subtitle: "Plan for your goals", value: "Planning", badge: "Goals", icon: "list" },
        { title: "Investment Management", subtitle: "Align your portfolio", value: "Investing", badge: "Portfolio", icon: "star" },
        { title: "Retirement Strategies", subtitle: "Prepare for retirement income", value: "Retirement", badge: "Income", icon: "calendar" },
        { title: "Legacy Planning", subtitle: "Plan for your family and your estate", value: "Legacy", badge: "Estate", icon: "heart" },
      ],
      detail: {
        optionsTitle: "Choose a priority",
        options: ["Family", "Retirement", "Legacy"],
        primaryAction: "Save interest",
        confirmation: "Interest saved",
      },
      account: {
        name: "Demo account",
        subtitle: "Fortitude Financial services explorer",
        rows: [
          { title: "Preferences", icon: "settings" },
          { title: "Privacy", icon: "lock" },
          { title: "Contact Fortitude", icon: "phone" },
        ],
        toggle: "Planning updates",
      },
    },
  },
  gap: {
    displayName: "Gap",
    industry: "retail",
    tagline: "Holiday collection",
    brand: { primary: "#002C5F", accent: "#C8102E", highlight: "#F2C14E", surface: "#F3F1EC", onPrimary: "#FFFFFF" },
  },
  amdocs: {
    displayName: "Amdocs NWM",
    industry: "telecom",
    tagline: "Network workflow management",
    brand: { primary: "#1A1446", accent: "#E5007D", highlight: "#00B0F0", surface: "#EEF0F7", onPrimary: "#FFFFFF" },
  },
  cytric: {
    displayName: "cytric",
    industry: "travel",
    tagline: "Corporate travel & expense",
    brand: { primary: "#005EB8", accent: "#00A3E0", highlight: "#FFB81C", surface: "#EEF4FA", onPrimary: "#FFFFFF" },
  },
};

const KEYWORDS = [
  ["clinical", /(pharma|clinical|trial|health|bio|medic|therap|care|evinova|iqvia|medidata)/i],
  ["banking", /(bank|financ|capital|credit|pay|wealth|invest|fund|westpac|chase|commbank)/i],
  ["travel", /(air|travel|trip|hotel|flight|cytric|amadeus|expedia|booking)/i],
  ["telecom", /(tele|mobile|wireless|network|amdocs|verizon|vodafone|t-mobile|fiber)/i],
  ["retail", /(shop|store|retail|fashion|apparel|mart|gap|nike|target|outfit)/i],
];

export function guessIndustry(name) {
  for (const [industry, re] of KEYWORDS) if (re.test(name)) return industry;
  return "generic";
}
