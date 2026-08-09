export type LoginAction = {
  label: string
  href: string
}

export type LoginSupportLink = {
  label: string
  href: string
}

export type LoginExperience = {
  audience: 'client' | 'operator'
  route: string
  eyebrow: string
  title: string
  body: string
  actions: LoginAction[]
  supportLinks: LoginSupportLink[]
  allowedRedirects: string[]
}

const supportEmailHref = 'mailto:hello@oyeimagine.com'

export function getClientLoginExperience(): LoginExperience {
  return {
    audience: 'client',
    route: '/login/client',
    eyebrow: 'Client access',
    title: 'Client sign in',
    body:
      'Role-safe client authentication for live workspace access, governed finance visibility, and canonical Neejee workspace truth.',
    actions: [
      { label: 'Continue as client', href: '/login/client' },
      { label: 'Talk to support', href: '/contact' },
    ],
    supportLinks: [
      { label: 'Need onboarding help', href: '/contact' },
      { label: 'Email support', href: supportEmailHref },
    ],
    allowedRedirects: ['/client', '/client/finance', '/client/concierge'],
  }
}

export function getAdminLoginExperience(): LoginExperience {
  return {
    audience: 'operator',
    route: '/login/admin',
    eyebrow: 'Operator access',
    title: 'Operator sign in',
    body:
      'Protected operator authentication for admin control, runtime governance, workspace selection, and support operations. This route is not intended for client users.',
    actions: [
      { label: 'Continue as operator', href: '/login/admin' },
      { label: 'Operator support', href: '/contact' },
    ],
    supportLinks: [
      { label: 'Operator support', href: '/contact' },
      { label: 'System contact', href: supportEmailHref },
    ],
    allowedRedirects: ['/admin', '/admin/ops', '/admin/settings', '/admin/commercial/onboarding-workspace'],
  }
}
