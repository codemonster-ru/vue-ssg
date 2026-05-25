import type { PluginOption } from 'vite'

export interface MarkdownPlaygroundsOptions {
  contentRoot: string
  generatedRegistryPath: string
}

export interface MarkdownPlaygroundsResult {
  plugin: PluginOption
}

export function createSafeMarkdownComponentPlaygrounds(
  options: MarkdownPlaygroundsOptions
): MarkdownPlaygroundsResult
