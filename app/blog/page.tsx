import type { Metadata } from "next";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "Native Medicine Garden Blog | Cannabis Menu Guides",
  description: "Read Native Medicine Garden cannabis menu guides, flower tier notes, and local store checks for Toronto shoppers.",
  alternates: {
    canonical: "https://www.nativemedicinecannabis.com/blog",
  },
};

export default function BlogPage() {
  return <BlogContent />;
}
