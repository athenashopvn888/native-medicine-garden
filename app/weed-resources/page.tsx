import type { Metadata } from "next";
import ResourceView from "../resources/ResourceView";
import { RESOURCE_HOME } from "../resources/resourceData";

export const metadata: Metadata = {
  title: { absolute: "Native Medicine Garden Weed Resources | Toronto Cannabis Guides" },
  description: "Explore Native Medicine Garden Weed resources for flower collections, menu categories, value browsing and Toronto visit information.",
  alternates: { canonical: "https://www.nativemedicinecannabis.com/weed-resources" },
};

export default function WeedResourcesPage() {
  return <ResourceView page={{ ...RESOURCE_HOME, title: "Weed & Cannabis Resources" }} />;
}
