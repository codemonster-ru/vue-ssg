import type { DocsConfig } from './src/content/config'

export function createDocsBaseConfig(currentYear: number): DocsConfig {
  return {
    site: {
      title: '__PROJECT_NAME__',
      description: 'Package documentation powered by Codemonster Vue SSG.',
      githubUrl: 'https://github.com/codemonster-ru/vue-ssg',
      homeTo: '/',
      favicon: '/logo.svg',
      logo: {
        alt: '__PROJECT_NAME__',
        height: 28
      },
      logoLabel: 'Docs'
    },
    home: {
      title: 'Documentation',
      description: 'Guides and API references for your package ecosystem',
      showGrid: true
    },
    headerNav: {
      ariaLabel: 'Main navigation',
      items: []
    },
    layout: {
      variant: 'sidebar-content-aside',
      fillViewport: true,
      stickyHeader: true,
      stickySidebar: true,
      stickyAside: true,
      edgeNotches: true,
      hideSidebarOnMobile: true,
      hideAsideOnMobile: true
    },
    footer: {
      left: `© ${currentYear} __PROJECT_NAME__`
    },
    sectionLabels: {
      packages: {
        label: 'Packages',
        order: 1
      }
    },
    toc: {
      levels: [2, 3, 4],
      scrollOffset: 96
    }
  }
}
