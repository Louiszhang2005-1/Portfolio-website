import type { Metadata } from "next";
import DriveGame from "@/components/drive/DriveGame";
import { buildWorld } from "@/components/drive/driveData";

const description =
  "Drive a small car around a 3D world to explore Louis Zhang's engineering projects, internships at Tesla, Lockheed Martin and the City of Montréal, and hackathon wins.";

/** its own link preview (LinkedIn, iMessage, Slack...), so it doesn't repeat the homepage's */
export const metadata: Metadata = {
  title: "Drive",
  description,
  openGraph: {
    title: "Louis Zhang — Drive through my portfolio",
    description,
    url: "/game",
    images: [{ url: "/og-game.jpg", width: 1200, height: 630, alt: "Louis Zhang's portfolio as a 3D driving world" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Zhang — Drive through my portfolio",
    description,
    images: ["/og-game.jpg"],
  },
};

/** built once at build time on the server; the client only gets the stops it needs */
const world = buildWorld();

export default function GamePage() {
  return <DriveGame world={world} />;
}
