/** Planet ↔ section mapping (matrix-nav). Order matches SolarSystemInner planet order. */
export const PLANET_KEYS = ['mercury', 'earth', 'mars', 'jupiter']

export const PLANET_NAV_META = {
  mercury: {
    key: 'mercury',
    sectionId: 'hero',
    label: 'ORIGIN',
    title: 'Home',
    accent: 'Signal — hero',
    body:
      'Entry vector: identity, positioning, and first contact. Open the full Hero sector below when you are ready to scroll.',
  },
  earth: {
    key: 'earth',
    sectionId: 'experience',
    label: 'TRAJECTORY',
    title: 'Experience',
    accent: 'Roles · internships · clubs',
    body:
      'Timeline of engineering work, collaborations, and leadership. Drop into the Experience band for the complete arc.',
  },
  mars: {
    key: 'mars',
    sectionId: 'about',
    label: 'PROFILE',
    title: 'About',
    accent: 'Background · stack · focus',
    body:
      'Mission briefing: who I am, what I build, and how I think. Mars maps to your About sector.',
  },
  jupiter: {
    key: 'jupiter',
    sectionId: 'projects',
    label: 'ARCHIVE',
    title: 'Projects',
    accent: 'Shipped work · experiments',
    body:
      'Largest band in the system — selected builds and product narratives. Jupiter maps to Projects.',
  },
}
