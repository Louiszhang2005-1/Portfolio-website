"use client";

import React, { HTMLAttributes, useEffect, useRef, useState } from "react";

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface GalleryItem {
  id: string;
  common: string;
  binomial: string;
  href?: string;
  accent?: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
  rotationOffset?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed: _autoRotateSpeed = 0.02, rotationOffset = 0, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const tickingRef = useRef(false);

    useEffect(() => {
      const handleScroll = () => {
        if (tickingRef.current) {
          return;
        }

        tickingRef.current = true;
        requestAnimationFrame(() => {
          const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
          setRotation(scrollProgress * 360);
          tickingRef.current = false;
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const anglePerItem = 360 / items.length;
    const visibleRotation = rotation + rotationOffset;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative flex h-full w-full items-center justify-center", className)}
        style={{ perspective: "2000px" }}
        {...props}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotateY(${visibleRotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, index) => {
            const itemAngle = index * anglePerItem;
            const totalRotation = visibleRotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.26, 1 - normalizedAngle / 180);
            const Wrapper = item.href ? "a" : "div";

            return (
              <Wrapper
                key={item.id}
                href={item.href}
                role="group"
                aria-label={item.common}
                className="absolute h-[360px] w-[270px] outline-none transition-transform duration-300 hover:scale-105 focus-visible:scale-105 sm:h-[400px] sm:w-[300px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-150px",
                  marginTop: "-200px",
                  opacity,
                  transition: "opacity 0.3s linear, scale 0.3s ease",
                }}
              >
                <div className="group relative h-full w-full overflow-hidden rounded-lg border border-white/20 bg-black/30 shadow-2xl backdrop-blur-lg">
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: item.photo.pos || "center" }}
                  />
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `linear-gradient(180deg, transparent 35%, ${item.accent ?? "#000"} 135%)`,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 text-white">
                    <h2 className="font-headline text-xl font-bold">{item.common}</h2>
                    <em className="text-sm italic opacity-80">{item.binomial}</em>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide opacity-70">{item.photo.by}</p>
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
