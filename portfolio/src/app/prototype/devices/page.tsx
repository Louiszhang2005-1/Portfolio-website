import type { Metadata } from "next";
import DeviceEcosystem from "@/components/prototype/DeviceEcosystem";

export const metadata: Metadata = {
  // absolute: skip the root layout's title template
  title: { absolute: "Louis Zhang · Mechanical engineering portfolio" },
  description:
    "Louis Zhang, mechanical engineering student at Polytechnique Montréal, shows the hardware, software and internships behind his work.",
  robots: { index: false, follow: false },
};

export default function DevicePrototypePage() {
  return <DeviceEcosystem />;
}
