import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/** Canonical role identifiers.
 *  - dealer  : Dealer / distribution unit
 *  - rm      : Regional Manager
 *  - scm     : Supply Chain Management
 *  - admin   : Platform administrator
 */
export type Role = 'dealer' | 'rm' | 'scm' | 'admin'

export interface WorkspaceConfig {
  role: Role
  /** Short label shown in selectors and badges */
  label: string
  /** Full display name shown in the sidebar header */
  displayName: string
  /** Root path for this workspace (e.g. /dealer/dashboard) */
  homePath: string
  sections: NavSection[]
}