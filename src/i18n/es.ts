import type { Translations } from "./en"

const es: Translations = {
  common: {
    seekitup: "Seekitup",
    link_one: "{{count}} link",
    link_other: "{{count}} links",
    comingSoon: "Próximamente",
  },

  downloadPage: {
    metaTitle: "Descargá Seekitup — Guardá y Compartí tus Links",
    metaDescription:
      "Seekitup te ayuda a guardar, organizar y compartir tus links favoritos en colecciones hermosas. Descargalo ahora para iOS y Android.",
    heading: "Guardá, organizá y",
    headingHighlight: "compartí",
    headingEnd: "tus links favoritos",
    subtitle:
      "Guardá links de donde sea, organizalos en colecciones y compartilos con quien quieras.",
  },

  collectionPage: {
    metaTitleNotFound: "Colección no encontrada | Seekitup",
    metaTitle: "{{name}} por @{{username}} | Seekitup",
    metaDescriptionFallback: "Explorá {{name}} en Seekitup",
    ogDescriptionFallback: "Una colección de @{{username}}",
    errorTitle: "Colección no encontrada",
    errorDescription:
      "Esta colección puede haber sido eliminada, configurada como privada, o no existe.",
    errorCta: "Descargá Seekitup",
    emptyLinks: "No hay links en esta colección todavía.",
  },

  invitationPage: {
    metaTitle: "{{inviter}} te invitó a {{name}} | Seekitup",
    title: "{{name}} te invitó",
    subtitle: "a colaborar en una colección",
    collectionLabel: "Colección",
    itemCount_one: "{{count}} link",
    itemCount_other: "{{count}} links",
    description:
      "Aceptá esta invitación desde la app de Seekitup para empezar a colaborar.",
    alreadyAcceptedTitle: "Ya aceptaste esta invitación",
    alreadyAcceptedDescription:
      "Abrí Seekitup en tu dispositivo para ver la colección.",
    viewCollection: "Ver colección en la web",
  },

  notFoundPage: {
    metaTitle: "Página no encontrada | Seekitup",
    title: "Página no encontrada",
    description:
      "La página que estás buscando no existe o fue movida.",
    cta: "Descargá Seekitup",
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
