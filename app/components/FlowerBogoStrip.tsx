import Link from "next/link";
import { TIER_CONFIG } from "../lib/products";
import { formatSitewideBogoStrip } from "../lib/flowerDeals";

export function flowerBogoStripLabel(): string {
  return TIER_CONFIG["AAA+"].deal6g ? formatSitewideBogoStrip() : "";
}

export default function FlowerBogoStrip({ hero = false }: { hero?: boolean }) {
  const label = flowerBogoStripLabel();
  if (!label) return null;
  const splitAt = label.indexOf("  ");
  const lead = splitAt === -1 ? label : label.slice(0, splitAt);
  const tail = splitAt === -1 ? "" : label.slice(splitAt + 2);

  return (
    <Link href="/aaa-weed" data-flower-bogo-strip={hero ? "hero" : "nav"}>
      <span data-bogo-strip-copy="">
        <span data-bogo-offer-lead="">{lead}</span>
        {tail ? <><span data-bogo-offer-gap="">{"  "}</span><span data-bogo-offer-tail="">{tail}</span></> : null}
      </span>
    </Link>
  );
}
