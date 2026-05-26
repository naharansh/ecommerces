"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll, { StaggerChildren } from "@/components/AnimateOnScroll";
import { PageLoader } from "@/components/Loader";
import { productAPI } from "@/lib/api";

interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  compare_price?: number;
  image_url?: string;
  images?: ProductImage[];
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const featured = searchParams.get("featured");
        const category = searchParams.get("category");
        const params: Record<string, string> = { limit: "20", sort };
        if (featured) params.featured = "true";
        if (category) params.category = category;
        const { data } = await productAPI.getAll(params);
        setProducts(data?.products || data?.data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams, sort]);

  return (
    <>
      <AnimateOnScroll type="fadeIn" duration={600}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#333]">Shop</h1>
            <p className="text-sm text-[#999]">{products.length} products found</p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full sm:w-auto border border-[#ebebeb] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#c96] transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
          </select>
        </div>
      </AnimateOnScroll>

      {loading ? (
        <PageLoader text="Loading products..." />
      ) : products.length > 0 ? (
        <StaggerChildren staggerDelay={80} duration={400} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerChildren>
      ) : (
        <AnimateOnScroll type="fadeIn" duration={500}>
          <div className="text-center py-20">
            <p className="text-[#999]">No products found.</p>
          </div>
        </AnimateOnScroll>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <Suspense fallback={<PageLoader text="Loading products..." />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
