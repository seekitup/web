const en = {
  common: {
    seekitup: "Seekitup",
    link_one: "{{count}} link",
    link_other: "{{count}} links",
    comingSoon: "Coming soon",
  },

  downloadPage: {
    metaTitle: "Download Seekitup — Save & Share Links Beautifully",
    metaDescription:
      "Seekitup helps you save, organize, and share your favorite links in beautiful collections. Download now for iOS and Android.",
    heading: "Save, organize &",
    headingHighlight: "share",
    headingEnd: "your favorite links",
    subtitle:
      "Save links from anywhere, organize them into collections and share them with anyone.",
  },

  collectionPage: {
    metaTitleNotFound: "Collection not found | Seekitup",
    metaTitle: "{{name}} by @{{username}} | Seekitup",
    metaDescriptionFallback: "Explore {{name}} on Seekitup",
    ogDescriptionFallback: "A collection by @{{username}}",
    errorTitle: "Collection not found",
    errorDescription:
      "This collection may have been removed, set to private, or doesn't exist.",
    errorCta: "Download Seekitup",
    emptyLinks: "No links in this collection yet.",
  },

  invitationPage: {
    metaTitle: "{{inviter}} invited you to {{name}} | Seekitup",
    title: "{{name}} invited you",
    subtitle: "to collaborate on a collection",
    collectionLabel: "Collection",
    itemCount_one: "{{count}} link",
    itemCount_other: "{{count}} links",
    description:
      "Accept this invitation from the Seekitup app to start collaborating.",
    alreadyAcceptedTitle: "You've already accepted this invitation",
    alreadyAcceptedDescription:
      "Open Seekitup on your device to view the collection.",
    viewCollection: "View collection on the web",
  },

  notFoundPage: {
    metaTitle: "Page not found | Seekitup",
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or has been moved.",
    cta: "Download Seekitup",
  },

  appBanner: {
    tagline: "Save, organize & share your links",
    openInApp: "Open app",
    getTheApp: "Get the app",
    dismiss: "Dismiss",
  },

  childCollections: {
    title: "Subcollections",
    seeAll: "See all",
  },

  linkSection: {
    title: "Links",
  },

  linkCard: {
    watchOnYouTube: "Watch on YouTube ↗",
  },

  appStoreBadges: {
    applePrefix: "Download on the",
    appleStore: "App Store",
    googlePrefix: "Get it on",
    googleStore: "Google Play",
  },

  viewToggle: {
    listView: "List view",
    gridView: "Grid view",
    complete: "Complete",
    grid: "Grid",
  },
}

export default en
export type Translations = typeof en
