import type { Metadata } from "next";
import GamesContent from "./GamesContent";

export const metadata: Metadata = {
  title: "Cannabis Arcade Games — Native Medicine Garden | Toronto",
  description: "Play free online cannabis-themed games like Flappy Bud and Snake Munchies while you wait at Native Medicine Garden.",
  alternates: {
    canonical: "https://nativemedicinecannabis.com/games",
  },
};

export default function GamesPage() {
  return <GamesContent />;
}
