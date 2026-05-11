import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// TODO: set metadataBase to the production Vercel URL once deployed, e.g.:
// metadataBase: new URL("https://your-project.vercel.app")
export const metadata: Metadata = {
  title: {
    default: "Louis Zhang — Engineering Portfolio",
    template: "%s | Louis Zhang",
  },
  description:
    "Mechanical & software engineering portfolio — projects spanning aerospace, robotics & electronics, and full-stack software. Internships at City of Montreal, Lockheed Martin, and Tesla. Includes a playable nautical game version.",
  openGraph: {
    siteName: "Louis Zhang",
    title: "Louis Zhang — Engineering Portfolio",
    description:
      "Aerospace, robotics, and software projects from an engineering student. Internships at Tesla, Lockheed Martin, and City of Montreal. Also a playable game.",
    type: "website",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/preview-portfolio.png",
        alt: "Louis Zhang — engineering portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Zhang — Engineering Portfolio",
    description:
      "Aerospace, robotics, and software projects. Internships at Tesla, Lockheed Martin, and City of Montreal.",
    images: ["/preview-portfolio.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-[var(--color-background)]">
        {children}
      </body>
    </html>
  );
}
