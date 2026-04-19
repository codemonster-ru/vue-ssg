import { defineDocsConfig } from '@codemonster-ru/vue-ssg-core'
import DocsLogoIcon from './src/components/DocsLogoIcon.vue'

export default defineDocsConfig({
  site: {
    title: 'docs',
    description: 'Static documentation starter for the Codemonster Vue stack.',
    githubUrl: 'https://github.com/codemonster-ru/vue-ssg',
    homeTo: '/',
    favicon: '/logo.svg',
    logo: {
      alt: 'Codemonster',
      height: 28,
      component: DocsLogoIcon
    },
    logoLabel: 'Docs'
  },
  home: {
    title: 'Build docs fast',
    description: 'Write markdown, keep the same UI stack, and ship clean developer docs.',
    showGrid: true,
    primaryAction: {
      label: 'Get Started',
      to: '/guide/installation'
    },
    secondaryAction: {
      label: 'View on GitHub',
      href: 'https://github.com/codemonster-ru/vue-ssg'
    }
  },
  headerNav: {
    ariaLabel: 'Main navigation',
    items: [
      {
        value: 'guide',
        label: 'Guide',
        to: '/guide/overview'
      },
      {
        value: 'components',
        label: 'Components',
        children: [
          {
            value: 'components-core',
            label: 'Core',
            to: '/core/theme'
          },
          {
            value: 'components-layouts',
            label: 'Layouts',
            to: '/layouts/document-layout'
          }
        ]
      }
    ]
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
    left: '© 2026 Codemonster | Kirill Kolesnikov. All rights reserved.'
  },
  sectionLabels: {
    guide: {
      label: 'Guide',
      order: 1
    },
    core: {
      label: 'Core',
      order: 2
    },
    layouts: {
      label: 'Layouts',
      order: 3
    }
  },
  toc: {
    levels: [2, 3, 4],
    scrollOffset: 96
  }
})
