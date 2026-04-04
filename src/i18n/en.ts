const en = {
  common: {
    seekitup: "SeekItUp",
    link_one: "{{count}} link",
    link_other: "{{count}} links",
    comingSoon: "Coming soon",
  },

  downloadPage: {
    metaTitle: "Download SeekItUp — Save & Share Links Beautifully",
    metaDescription:
      "SeekItUp helps you save, organize, and share your favorite links in beautiful collections. Download now for iOS and Android.",
    heading: "Save, organize &",
    headingHighlight: "share",
    headingEnd: "your favorite links",
    subtitle:
      "Save links from anywhere, organize them into collections and share them with anyone.",
  },

  collectionPage: {
    metaTitleNotFound: "Collection not found | SeekItUp",
    metaTitle: "{{name}} by @{{username}} | SeekItUp",
    metaDescriptionFallback: "Explore {{name}} on SeekItUp",
    ogDescriptionFallback: "A collection by @{{username}}",
    errorTitle: "Collection not found",
    errorDescription:
      "This collection may have been removed, set to private, or doesn't exist.",
    errorCta: "Download SeekItUp",
    emptyLinks: "No links in this collection yet.",
  },

  notFoundPage: {
    metaTitle: "Page not found | SeekItUp",
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or has been moved.",
    cta: "Download SeekItUp",
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
