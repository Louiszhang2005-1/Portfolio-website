import PortfolioHome from "@/components/portfolio/PortfolioHome";

export const metadata = {
  title: "Louis Zhang - Portfolio",
  description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
  openGraph: {
    title: "Louis Zhang - Portfolio",
    description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
    url: "/",
    images: [{ url: "/preview-portfolio.png", alt: "Louis Zhang portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Zhang - Portfolio",
    description: "Mechanical and software engineer. Projects spanning aerospace, robotics, and full-stack development.",
    images: ["/preview-portfolio.png"],
  },
};

export default function Home() {
  return <PortfolioHome />;
}
