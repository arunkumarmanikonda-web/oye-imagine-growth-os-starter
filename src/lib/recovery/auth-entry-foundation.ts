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
    route: '/login',
    eyebrow: 'Client access',
    title: 'Sign in to your Oye !magine client workspace.',
    body:
      'Use the client login to access commercial records, dashboard visibility, reporting surfaces and governed support for active Oye !magine engagements.',
    actions: [
      { label: 'Continue as client', href: '/login' },
      { label: 'Talk to support', href: '/contact' }
    ],
    supportLinks: [
      { label: 'Need onboarding help', href: '/contact' },
      { label: 'Email support', href: supportEmailHref }
    ],
    allowedRedirects: ['/client', '/client/commercial', '/client/commercial/payments']
  }
}

export function getAdminLoginExperience(): LoginExperience {
  return {
    audience: 'operator',
    route: '/admin/login',
    eyebrow: 'Operator access',
    title: 'Sign in to the Oye !magine operator workspace.',
    body:
      'Use the operator login for content governance, support handling, commercial operations and the admin control plane. This route is not intended for client users.',
    actions: [
      { label: 'Continue as operator', href: '/admin/login' },
      { label: 'Open support inbox', href: '/admin/support' }
    ],
    supportLinks: [
      { label: 'Operator support', href: '/admin/support' },
      { label: 'System contact', href: supportEmailHref }
    ],
    allowedRedirects: ['/admin', '/admin/content', '/admin/config', '/admin/support']
  }
}