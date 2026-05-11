import PortfolioHero from "@/components/portfolio/PortfolioHero";
import FullPortfolioDeck from "@/components/portfolio/FullPortfolioDeck";
import ProjectOrbitGallery from "@/components/portfolio/ProjectOrbitGallery";
import GamePortalDashboard from "@/components/portfolio/GamePortalDashboard";
import PhysicsConstellation from "@/components/portfolio/PhysicsConstellation";
import Internships from "@/components/portfolio/Internships";
import Contact from "@/components/portfolio/Contact";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { activeProjects } from "@/lib/portfolio";

export const metadata = {
  title: "Louis Zhang - Portfolio",
  description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
  openGraph: {
    title: "Louis Zhang — Portfolio",
    description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
    url: "/portfolio",
    images: [{ url: "/preview-portfolio.png", alt: "Louis Zhang portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Zhang — Portfolio",
    description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
    images: ["/preview-portfolio.png"],
  },
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)]">
      <PortfolioHero />
      <FullPortfolioDeck />
      <Internships />
      <ProjectOrbitGallery projects={activeProjects} />
      <GamePortalDashboard />
      <PhysicsConstellation projects={activeProjects} />
      <Contact />
      <CinematicFooter />
    </div>
  );
}
