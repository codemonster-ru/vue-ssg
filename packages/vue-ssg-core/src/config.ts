import type { Component } from 'vue'

export interface DocsNavItem {
  value: string
  label: string
  kind?: 'item' | 'group'
  leadingIcon?: string
  href?: string
  to?: string | Record<string, unknown>
  target?: string
  rel?: string
  disabled?: boolean
  children?: DocsNavItem[]
}

export interface DocsTocItem {
  id: string
  label: string
  level?: number
  href?: string
}

export interface DocsSectionConfig {
  label?: string
  order?: number
}

export interface DocsTocConfig {
  levels?: number[]
  scrollOffset?: number
}

export interface DocsSiteLogoConfig {
  src?: string
  component?: Component
  alt?: string
  width?: number | string
  height?: number | string
}

export interface DocsHomeActionConfig {
  label: string
  to?: string
  href?: string
}

export interface DocsHomeConfig {
  enabled?: boolean
  title?: string
  description?: string
  showGrid?: boolean
  primaryAction?: DocsHomeActionConfig
  secondaryAction?: DocsHomeActionConfig
}

export interface DocsHeaderNavConfig {
  items?: DocsNavItem[]
  ariaLabel?: string
}

export type DocsLayoutVariant =
  | 'content'
  | 'sidebar-content'
  | 'sidebar-content-aside'

export interface DocsSiteConfig {
  title: string
  description?: string
  githubUrl?: string
  homeTo?: string
  favicon?: string
  logo?: DocsSiteLogoConfig
  logoLabel?: string
}

export interface DocsLayoutConfig {
  variant?: DocsLayoutVariant
  fillViewport?: boolean
  stickyHeader?: boolean
  stickySidebar?: boolean
  stickyAside?: boolean
  edgeNotches?: boolean
  hideSidebarOnMobile?: boolean
  hideAsideOnMobile?: boolean
}

export interface DocsFooterConfig {
  left?: string
  right?: string
}

export interface DocsPageMeta {
  title: string
  path: string
}

export interface DocsHeaderProps {
  site: DocsSiteConfig
}

export interface DocsBrandProps {
  site: DocsSiteConfig
}

export interface DocsFooterProps {
  site: DocsSiteConfig
}

export interface DocsHeaderNavProps {
  site: DocsSiteConfig
  items: DocsNavItem[]
  activeValue?: string
}

export interface DocsSidebarProps {
  site: DocsSiteConfig
  page: DocsPageMeta
  items: DocsNavItem[]
}

export interface DocsAsideProps {
  site: DocsSiteConfig
  page: DocsPageMeta
  items: DocsTocItem[]
}

export interface DocsLayoutProps {
  site: DocsSiteConfig
  page: DocsPageMeta
  layout: Required<DocsLayoutConfig>
  sidebarItems: DocsNavItem[]
  tocItems: DocsTocItem[]
}

export interface DocsComponentsConfig {
  Brand?: Component
  Home?: Component
  Header?: Component
  HeaderNav?: Component
  Footer?: Component
  SidebarTop?: Component
  SidebarBottom?: Component
  AsideTop?: Component
  AsideBottom?: Component
  Layout?: Component
}

export interface DocsConfig {
  title?: string
  site?: Partial<DocsSiteConfig>
  home?: DocsHomeConfig
  headerNav?: DocsHeaderNavConfig
  layout?: DocsLayoutConfig
  footer?: DocsFooterConfig
  components?: DocsComponentsConfig
  sectionLabels?: Record<string, DocsSectionConfig>
  toc?: DocsTocConfig
}

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config
}
