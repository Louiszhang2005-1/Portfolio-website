import { notFound } from "next/navigation";
import {
  allPortfolioItems,
  getPortfolioItemBySlug,
  getRelatedPortfolioItems,
} from "@/lib/portfolio";
import ProjectCaseStudy from "@/components/portfolio/ProjectCaseStudy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allPortfolioItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const item = getPortfolioItemBySlug(slug);

  if (!item) return { title: "Portfolio Item" };

  const ogImage = item.image ?? "/preview-portfolio.png";
  return {
    title: `${item.title} - Louis Zhang`,
    description: item.details.slice(0, 155),
    openGraph: {
      title: item.title,
      description: item.details.slice(0, 155),
      images: [{ url: ogImage, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.details.slice(0, 155),
      images: [ogImage],
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getPortfolioItemBySlug(slug);

  if (!item) notFound();

  const related = getRelatedPortfolioItems(item);

  return <ProjectCaseStudy item={item} related={related} />;
}
