"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";

function AnimatedCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="p-6 text-center transition-all duration-700 hover:scale-110">
      <p className="text-3xl font-bold text-[#c96] mb-1">
        {count}{suffix}
      </p>
      <p className="text-sm text-[#999]">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-16">
      <AnimateOnScroll type="fadeIn" duration={800}>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#333] mb-3">About ShopWave</h1>
          <p className="text-[#999] max-w-xl mx-auto">
            Your premier destination for quality products at unbeatable prices.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll type="slideUp" duration={700}>
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-xl font-bold text-[#333] mb-4">Our Story</h2>
            <p className="text-sm text-[#666] leading-relaxed mb-4">
              ShopWave was founded with a simple mission: to provide high-quality products
              at prices that don&apos;t break the bank. We believe that everyone deserves access
              to great products, whether it&apos;s furniture for your home, decor for your space,
              or gifts for your loved ones.
            </p>
            <p className="text-sm text-[#666] leading-relaxed mb-4">
              Our team carefully curates each product in our catalog, ensuring that every item
              meets our standards for quality, design, and value. We work directly with
              manufacturers and artisans to bring you the best products at the best prices.
            </p>
            <p className="text-sm text-[#666] leading-relaxed">
              Today, ShopWave serves thousands of customers worldwide, and we&apos;re
              committed to continuously improving your shopping experience.
            </p>
          </div>
          <div className="rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
            <img
              src="/assets/images/about/img-1.jpg"
              alt="About ShopWave"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              style={{ aspectRatio: "4/3" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll type="slideUp" duration={700}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <AnimatedCounter end={10} label="Happy Customers" suffix="K+" />
          <AnimatedCounter end={5} label="Products" suffix="K+" />
          <AnimatedCounter end={50} label="Categories" suffix="+" />
          <AnimatedCounter end={99} label="Satisfaction Rate" suffix="%" />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll type="scaleIn" duration={800}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#333] mb-4">Ready to start shopping?</h2>
          <Link
            href="/products"
            className="bg-[#c96] text-white px-10 py-3 rounded-sm text-sm font-medium inline-block hover:bg-[#c96]/90 transition-all duration-300 hover:scale-105 active:scale-95 "
          >
            Browse Our Store
          </Link>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
