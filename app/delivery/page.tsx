import type { Metadata } from "next";
import DeliveryContent from "./DeliveryContent";

export const metadata: Metadata = {
  title: "Delivery Coming Soon — Native Medicine Garden | Toronto",
  description: "Get notified when Native Medicine Garden launches same-day weed delivery across Toronto and surrounding areas.",
  alternates: {
    canonical: "https://nativemedicinecannabis.com/delivery",
  },
};

export default function DeliveryPage() {
  return <DeliveryContent />;
}
