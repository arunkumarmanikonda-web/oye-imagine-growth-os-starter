import { organizationProfile } from './organization-profile'
import { getContentPublishingSnapshot } from './content-governance-foundation'
import { getOperatorConfigExperience, getOperatorContentStudioExperience, getOperatorDashboardExperience } from './operator-foundation'
import { getSupportInboxSnapshot } from './support-inbox-foundation'
import { getRuntimeShellAudit } from './runtime-enforcement-foundation'
import { getContactExperience, getLoginHubExperience, getPublicHomepageExperience } from './surface-composer'

export function getMegaBatchAClosureAudit() {
  const homepage = getPublicHomepageExperience()
  const loginHub = getLoginHubExperience()
  const contact = getContactExperience()
  const operatorDashboard = getOperatorDashboardExperience()
  const operatorContentStudio = getOperatorContentStudioExperience()
  const operatorConfig = getOperatorConfigExperience()
  const supportInbox = getSupportInboxSnapshot()
  const contentPublishing = getContentPublishingSnapshot()
  const runtimeAudit = getRuntimeShellAudit()

  return {
    batch: 'Mega Batch A',
    branchExpectation: 'mega-batch-a-full-scope-rebuild',
    legalIdentity: {
      legalName: homepage.trustBlock.legalName,
      gstin: homepage.trustBlock.taxIdentity.gstin,
      cin: organizationProfile.cin,
      pan: organizationProfile.pan,
      tan: organizationProfile.tan
    },
    publicShell: {
      navigationLabels: homepage.navigation.map((item) => item.label),
      heroTitle: homepage.hero.title,
      heroBody: homepage.hero.body,
      hasPrototypeResidue:
        homepage.hero.title.toLowerCase().includes('100%') ||
        homepage.hero.title.toLowerCase().includes('shell overhaul') ||
        homepage.hero.body.toLowerCase().includes('operational readiness is complete'),
      supportChannels: contact.supportChannels
    },
    accessSplit: {
      loginPaths: loginHub.cards.map((card) => card.href),
      loginLabels: loginHub.cards.map((card) => card.label)
    },
    operatorShell: {
      dashboardCardPaths: operatorDashboard.cards.map((card) => card.href),
      dashboardTrustLegalName: operatorDashboard.trustBlock.legalName,
      contentStudioModuleCount: operatorContentStudio.modules.length,
      contentStudioSnapshot: operatorContentStudio.snapshot,
      providerNames: operatorConfig.providers.map((provider) => provider.name),
      supportChannelCount: operatorConfig.supportChannels.length
    },
    supportGovernance: {
      totalEvents: supportInbox.totalEvents,
      openCount: supportInbox.openCount,
      unassignedCount: supportInbox.unassignedCount,
      awaitingCustomerCount: supportInbox.awaitingCustomerCount,
      criticalOpenCount: supportInbox.criticalOpenCount,
      mailbox: supportInbox.mailbox
    },
    publishingGovernance: {
      totalWorkItems: contentPublishing.totalWorkItems,
      previewReadyCount: contentPublishing.previewReadyCount,
      rollbackReadyCount: contentPublishing.rollbackReadyCount,
      draftCount: contentPublishing.stateCounts.draft,
      reviewCount: contentPublishing.stateCounts.review,
      scheduledCount: contentPublishing.stateCounts.scheduled,
      publishedCount: contentPublishing.stateCounts.published
    },
    runtimeGovernance: {
      protectedPrefixes: runtimeAudit.protectedPrefixes,
      publicEntryPoints: runtimeAudit.publicEntryPoints,
      governanceRules: runtimeAudit.governanceRules,
      guardsEnabled: runtimeAudit.flags.guardsEnabled,
      liveSessionEnabled: runtimeAudit.flags.liveSessionEnabled
    }
  }
}