import type { Metadata } from "next";
import DeviceEcosystem from "@/components/prototype/DeviceEcosystem";

const title = "Louis Zhang · Mechanical engineering portfolio";
const description =
  "Louis Zhang, Mechanical Engineering Student at Polytechnique Montréal. Hardware, software and internships at Tesla, Lockheed Martin and the City of Montréal. Open to 2027 internship opportunities.";

export const metadata: Metadata = {
  // absolute: skip the root layout's title template
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    url: "/",
    images: [{ url: "/og-home.png", width: 1200, height: 630, alt: "Louis Zhang portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-home.png"],
  },
};

export default function Home() {
  return <DeviceEcosystem />;
}
