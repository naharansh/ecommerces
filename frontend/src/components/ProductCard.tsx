"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";

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
  slug?: string;
  is_featured?: boolean;
}

const fallbackImages = [
  "/assets/images/demos/demo-2/products/product-1-1.jpg",
  "/assets/images/demos/demo-2/products/product-2-1.jpg",
  "/assets/images/demos/demo-2/products/product-3-1.jpg",
  "/assets/images/demos/demo-2/products/product-4-1.jpg",
];

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const primaryImage = product.images?.find((img) => img.is_primary);
  const imgSrc = primaryImage?.image_url || product.image_url || fallbackImages[product.id % fallbackImages.length];

  return (
    <div className="product-card group bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square bg-[#f4f4f4] flex items-center justify-center overflow-hidden">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImages[0]; }}
            />
          </div>
        </Link>

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#ef837b] text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">
            -{discount}%
          </span>
        )}

        <button className="absolute top-3 right-3 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-[#c96]">
          <Heart size={16} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm translate-y-0 md:translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-[#c96] text-white text-xs font-medium py-2.5 rounded-sm flex items-center justify-center gap-2 hover:bg-[#b8865a] transition-colors">
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link
          href={`/products/${product.id}`}
          className="text-sm font-medium text-[#333] hover:text-[#c96] transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[#c96] font-semibold text-sm">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.compare_price && (
            <span className="text-[#999] text-xs line-through">
              ${Number(product.compare_price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
