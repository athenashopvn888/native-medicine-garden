import type { Metadata } from "next";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Cannabis Blog & Guides — Native Medicine Garden | Toronto",
  description: "Read the latest strain reviews, dosing guides, and cannabis news from Native Medicine Garden in Toronto.",
  alternates: {
    canonical: "https://nativemedicinecannabis.com/blog",
  },
};

export default function BlogPage() {
  return <BlogContent />;
}
