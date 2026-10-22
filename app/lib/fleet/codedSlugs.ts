import { DELIVERY_GUIDE_REGISTRY } from "../deliveryGuideRegistry.ts";
import { GUIDE_REGISTRY } from "../guideRegistry.ts";
import { RESOURCE_PAGES } from "../../resources/resourceData.ts";

/** Coded resource and guide slugs win over a fleet article with the same slug. */
export function codedContentSlugs(): Set<string> {
  return new Set(
    [
      ...RESOURCE_PAGES.map((page) => page.slug),
      ...GUIDE_REGISTRY.map((guide) => guide.slug),
      ...DELIVERY_GUIDE_REGISTRY.map((guide) => guide.slug),
    ].filter((slug): slug is string => Boolean(slug)),
  );
}
