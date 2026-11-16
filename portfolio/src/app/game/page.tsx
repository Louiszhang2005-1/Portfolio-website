import type { Metadata } from "next";
import DriveGame from "@/components/drive/DriveGame";
import { buildWorld } from "@/components/drive/driveData";

export const metadata: Metadata = {
  title: "Drive",
  description:
    "Drive a small car around a 3D world to explore Louis Zhang's engineering projects, internships at Tesla, Lockheed Martin and the City of Montréal, and hackathon wins.",
};

/** built once at build time on the server; the client only gets the stops it needs */
const world = buildWorld();

export default function GamePage() {
  return <DriveGame world={world} />;
}
