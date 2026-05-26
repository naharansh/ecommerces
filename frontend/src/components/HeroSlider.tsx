"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Furniture Collection",
    subtitle: "Discover Premium Furniture",
    description: "Explore our curated collection of modern and classic furniture pieces.",
    btnText: "Shop Now",
    image: "/assets/images/demos/demo-2/slider/slide-1.jpg",
  },
  {
    title: "Lighting Solutions",
    subtitle: "Illuminate Your Space",
    description: "Find the perfect lighting for every room in your home.",
    btnText: "Shop Lighting",
    image: "/assets/images/demos/demo-2/slider/slide-2.jpg",
  },
  {
    title: "Home Decor",
    subtitle: "Transform Your Home",
    description: "Unique decor items to make your space truly yours.",
    btnText: "Discover More",
    image: "/assets/images/demos/demo-2/slider/slide-3.jpg",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative overflow-hidden bg-[#f4ede4]">
      <div className="max-w-[1260px] mx-auto">
        <div className="relative min-h-[300px] md:min-h-[420px]">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center min-h-[300px] md:min-h-[420px]"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="w-full h-full bg-black/20 flex items-center min-h-[300px] md:min-h-[420px]">
                  <div className="max-w-[1260px] mx-auto px-4 py-12 md:py-24 flex flex-col items-start justify-center">
                    <p className="text-[#c96] font-medium text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-2xl md:text-5xl font-bold text-white max-w-md leading-tight mb-3 md:mb-4 drop-shadow-md">
                      {slide.title}
                    </h1>
                    <p className="text-white/90 text-xs md:text-base max-w-md mb-4 md:mb-6 drop-shadow-md">
                      {slide.description}
                    </p>
                    <Link
                      href="/products"
                      className="bg-[#c96] text-white px-6 md:px-8 py-2.5 md:py-3 text-xs md:text-sm font-medium rounded-sm hover:bg-[#b8865a] transition-colors inline-block"
                    >
                      {slide.btnText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === current ? "bg-[#c96]" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
