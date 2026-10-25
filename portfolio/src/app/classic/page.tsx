import type { Metadata } from "next";
import PortfolioHome from "@/components/portfolio/PortfolioHome";

// The previous homepage, kept reachable; the device-ecosystem page at "/" is the canonical one.
export const metadata: Metadata = {
  title: { absolute: "Louis Zhang · Classic portfolio" },
  description: "Previous version of Louis Zhang's engineering portfolio.",
  robots: { index: false, follow: true },
};

export default function ClassicHome() {
  return <PortfolioHome />;
}
