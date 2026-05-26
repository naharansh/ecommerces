"use client";

import { useEffect, useState } from "react";
import HeroSlider from "@/components/HeroSlider";
import BannerGrid from "@/components/BannerGrid";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { productAPI } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  compare_price?: number;
  image_url?: string;
  is_featured?: boolean;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featuredRes, recentRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getAll({ limit: "8", sort: "newest" }),
        ]);
        setFeaturedProducts(featuredRes.data?.products || featuredRes.data?.data || []);
        setRecentProducts(recentRes.data?.products || recentRes.data?.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <HeroSlider />

      <AnimateOnScroll type="fadeIn" duration={800}>
        <BannerGrid />
      </AnimateOnScroll>

      <AnimateOnScroll type="slideUp" duration={600}>
        <section className="max-w-[1260px] mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#333]">Featured Products</h2>
            <p className="text-sm text-[#999] mt-1">Hand-picked just for you</p>
          </div>
          <StaggerChildren staggerDelay={100} duration={400} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(featuredProducts.length > 0
              ? featuredProducts.slice(0, 8)
              : !loading
              ? []
              : Array.from({ length: 4 }, (_, i) => ({ id: i, name: "", price: 0 }))
            ).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerChildren>
        </section>
      </AnimateOnScroll>

      <AnimateOnScroll type="slideUp" duration={600}>
        <section className="bg-[#fafafa] py-10">
          <div className="max-w-[1260px] mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#333]">New Arrivals</h2>
              <p className="text-sm text-[#999] mt-1">The latest products added to our store</p>
            </div>
            <StaggerChildren staggerDelay={100} duration={400} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(recentProducts.length > 0
                ? recentProducts.slice(0, 8)
                : !loading
                ? []
                : Array.from({ length: 4 }, (_, i) => ({ id: i + 100, name: "", price: 0 }))
              ).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggerChildren>
          </div>
        </section>
      </AnimateOnScroll>

      <AnimateOnScroll type="scaleIn" duration={800}>
        <section className="bg-[#333] text-white py-16 text-center">
          <div className="max-w-[600px] mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Start Shopping?</h2>
            <p className="text-sm text-[#ccc] mb-6">
              Browse our full catalog and find exactly what you need.
            </p>
            <a
              href="/products"
              className="inline-block bg-[#c96] text-white px-10 py-3 text-sm font-medium rounded-sm hover:bg-[#c96]/90 transition-all hover:scale-105 active:scale-95"
            >
              Shop All Products
            </a>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
