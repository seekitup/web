import type { Translations } from "./en"

const es: Translations = {
  common: {
    seekitup: "SeekItUp",
    link_one: "{{count}} link",
    link_other: "{{count}} links",
  },

  downloadPage: {
    metaTitle: "Descargá SeekItUp — Guardá y Compartí tus Links",
    metaDescription:
      "SeekItUp te ayuda a guardar, organizar y compartir tus links favoritos en colecciones hermosas. Descargalo ahora para iOS y Android.",
    heading: "Guardá, organizá y",
    headingHighlight: "compartí",
    headingEnd: "tus links favoritos",
    subtitle:
      "Guardá links de donde sea, organizalos en colecciones y compartilos con quien quieras.",
  },

  collectionPage: {
    metaTitleNotFound: "Colección no encontrada | SeekItUp",
    metaTitle: "{{name}} por @{{username}} | SeekItUp",
    metaDescriptionFallback: "Explorá {{name}} en SeekItUp",
    ogDescriptionFallback: "Una colección de @{{username}}",
    errorTitle: "Colección no encontrada",
    errorDescription:
      "Esta colección puede haber sido eliminada, configurada como privada, o no existe.",
    errorCta: "Descargá SeekItUp",
    emptyLinks: "No hay links en esta colección todavía.",
  },

  notFoundPage: {
    metaTitle: "Página no encontrada | SeekItUp",
    title: "Página no encontrada",
    description:
      "La página que estás buscando no existe o fue movida.",
    cta: "Descargá SeekItUp",
  },

  appBanner: {
    tagline: "Guardá, organizá y compartí tus links",
    openInApp: "Abrir app",
    getTheApp: "Obtener la app",
    dismiss: "Cerrar",
  },

  childCollections: {
    title: "Subcolecciones",
    seeAll: "Ver todo",
  },

  linkSection: {
    title: "Links",
  },

  linkCard: {
    watchOnYouTube: "Ver en YouTube ↗",
  },

  appStoreBadges: {
    applePrefix: "Descargalo en",
    appleStore: "App Store",
    googlePrefix: "Disponible en",
    googleStore: "Google Play",
  },

  viewToggle: {
    listView: "Vista de lista",
    gridView: "Vista de grilla",
    complete: "Completo",
    grid: "Grilla",
  },
}

export default es
