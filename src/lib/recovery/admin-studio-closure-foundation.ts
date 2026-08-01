export type OperatorRole = 'super_admin' | 'content_manager' | 'support_operator'
export type StudioSectionKey = 'content_studio' | 'publish_control' | 'config_control' | 'support_desk'
export type StudioActionKey = 'edit_content' | 'publish_changes' | 'update_config' | 'respond_support'

export type AdminStudioSection = {
  key: StudioSectionKey
  title: string
  route: string
  requiredRoles: OperatorRole[]
  queueCount: number
  governanceBound: boolean
}

export type AdminStudioAction = {
  key: StudioActionKey
  label: string
  requiredRoles: OperatorRole[]
  section: StudioSectionKey
}

export type AdminStudioState = {
  role: OperatorRole
  accessibleSections: AdminStudioSection[]
  availableActions: AdminStudioAction[]
  queueSummary: {
    totalQueues: number
    totalItems: number
  }
}

const canonicalStudioSections: AdminStudioSection[] = [
  {
    key: 'content_studio',
    title: 'Content studio',
    route: '/admin/studio/content',
    requiredRoles: ['super_admin', 'content_manager'],
    queueCount: 3,
    governanceBound: true
  },
  {
    key: 'publish_control',
    title: 'Publish control',
    route: '/admin/studio/publish',
    requiredRoles: ['super_admin', 'content_manager'],
    queueCount: 2,
    governanceBound: true
  },
  {
    key: 'config_control',
    title: 'Configuration control',
    route: '/admin/studio/config',
    requiredRoles: ['super_admin'],
    queueCount: 1,
    governanceBound: true
  },
  {
    key: 'support_desk',
    title: 'Support desk',
    route: '/admin/studio/support',
    requiredRoles: ['super_admin', 'support_operator'],
    queueCount: 4,
    governanceBound: true
  }
]

const canonicalStudioActions: AdminStudioAction[] = [
  {
    key: 'edit_content',
    label: 'Edit CMS content',
    requiredRoles: ['super_admin', 'content_manager'],
    section: 'content_studio'
  },
  {
    key: 'publish_changes',
    label: 'Publish approved changes',
    requiredRoles: ['super_admin', 'content_manager'],
    section: 'publish_control'
  },
  {
    key: 'update_config',
    label: 'Update runtime configuration',
    requiredRoles: ['super_admin'],
    section: 'config_control'
  },
  {
    key: 'respond_support',
    label: 'Respond to support queue',
    requiredRoles: ['super_admin', 'support_operator'],
    section: 'support_desk'
  }
]

function cloneSection(section: AdminStudioSection): AdminStudioSection {
  return {
    ...section,
    requiredRoles: [...section.requiredRoles]
  }
}

function cloneAction(action: AdminStudioAction): AdminStudioAction {
  return {
    ...action,
    requiredRoles: [...action.requiredRoles]
  }
}

export function getAdminStudioRegistry() {
  return {
    sections: canonicalStudioSections.map(cloneSection),
    actions: canonicalStudioActions.map(cloneAction)
  }
}

export function canAccessStudioSection(role: OperatorRole, section: AdminStudioSection) {
  return section.requiredRoles.includes(role)
}

export function buildAdminStudioState(role: OperatorRole): AdminStudioState {
  const accessibleSections = canonicalStudioSections
    .filter((section) => canAccessStudioSection(role, section))
    .map(cloneSection)

  const availableActions = canonicalStudioActions
    .filter((action) => action.requiredRoles.includes(role))
    .map(cloneAction)

  return {
    role,
    accessibleSections,
    availableActions,
    queueSummary: {
      totalQueues: accessibleSections.length,
      totalItems: accessibleSections.reduce((sum, section) => sum + section.queueCount, 0)
    }
  }
}

export function getAdminStudioAudit() {
  return {
    registry: getAdminStudioRegistry(),
    states: {
      super_admin: buildAdminStudioState('super_admin'),
      content_manager: buildAdminStudioState('content_manager'),
      support_operator: buildAdminStudioState('support_operator')
    },
    proofScope: {
      functional: 'role-aware admin studio contract available',
      visible: 'pending actual admin studio UI adoption',
      data: 'canonical studio sections, actions and queue counts fixed',
      governance: 'access and operator action rules available'
    }
  }
}