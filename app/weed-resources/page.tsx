import type { Metadata } from "next";
import ResourceView from "../resources/ResourceView";
import { RESOURCE_HOME } from "../resources/resourceData";

export const metadata: Metadata = {
  title: { absolute: "Native Medicine Garden Weed Resources | Toronto Cannabis Guides" },
  description: RESOURCE_HOME.description,
  alternates: { canonical: "https://www.nativemedicinecannabis.com/weed-resources" },
  robots: { index: true, follow: true },
};

export default function WeedResourcesPage() {
  return <ResourceView page={{ ...RESOURCE_HOME, title: "Weed & Cannabis Resources" }} />;
}
