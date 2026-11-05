export type MementoTask = {
  name: string
  glyph: string
  status: string
  next: string | null
  updatedMs: number | null
}

export type MementoStatus = {
  workspace: string
  mode: 'core' | 'full'
  guardsOff: boolean
  backups: number
  behind: string[]
  checkpoint: { operation: string; next: string | null } | null
  tasks: MementoTask[]
  unverified: number
  checkedAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'memento-panel': {
      status: Shaped<MementoStatus | null>
      hidden: string
    }
  }
}
