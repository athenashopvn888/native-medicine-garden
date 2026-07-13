import type { Metadata } from "next";
import DeliveryContent from "./DeliveryContent";

export const metadata: Metadata = {
  title: "Delivery Coming Soon Native Medicine Garden | Toronto",
  description:
    "Get notified when Native Medicine Garden prepares delivery updates for Gerrard Street West and Bay Street, Downtown Toronto, and nearby local areas.",
  alternates: {
    canonical: "https://nativemedicinecannabis.com/delivery",
  },
};

export default function DeliveryPage() {
  return <DeliveryContent />;
}
