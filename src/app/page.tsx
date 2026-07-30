import {
  FaqSection,
  LoginLaneSection,
  MarketplaceOfferSection,
  PeopleDirectorySection,
  PublicHeroSection,
  SupportStrip,
} from "@/components/foundation/public-shell";
import {
  buildExpertProfiles,
  buildFaqEntries,
  buildLeadershipProfiles,
  buildLoginLaneModels,
  buildMarketplaceOfferCards,
  buildPublicHeroModel,
  buildPublicTrustMarkers,
  buildSupportStripModel,
} from "@/lib/foundation/public-shell";

export default function HomePage() {
  return (
    <>
      <PublicHeroSection hero={buildPublicHeroModel()} trustMarkers={buildPublicTrustMarkers()} />
      <LoginLaneSection lanes={buildLoginLaneModels()} />
      <MarketplaceOfferSection offers={buildMarketplaceOfferCards()} />
      <PeopleDirectorySection
        leadership={buildLeadershipProfiles()}
        experts={buildExpertProfiles()}
      />
      <FaqSection faqs={buildFaqEntries()} />
      <SupportStrip support={buildSupportStripModel()} />
    </>
  );
}