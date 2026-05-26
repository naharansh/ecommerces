"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Heart, ChevronRight, Star, Share2, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ProductCard from "@/components/ProductCard";
import { PageLoader } from "@/components/Loader";
import { productAPI, cartAPI, userAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface ReviewUser {
  id: number;
  name: string;
  avatar_url?: string;
}

interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  user: ReviewUser;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  stock_qty: number;
  sku: string;
  is_featured: boolean;
  category?: { id: number; name: string };
  images?: ProductImage[];
  vendor?: { id: number; store_name: string };
  reviews?: Review[];
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  compare_price?: number;
  image_url?: string;
  images?: ProductImage[];
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#ddd]"}
        />
      ))}
    </div>
  );
}

function StockBar({ stock }: { stock: number }) {
  const level = stock > 50 ? "high" : stock > 10 ? "medium" : "low";
  const color = level === "high" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500";
  const pct = Math.min(stock / 100, 1) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#eee] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#666] font-medium whitespace-nowrap">{stock} available</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await productAPI.getById(params.id as string);
        setProduct(data?.product || data?.data || data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  useEffect(() => {
    if (!product?.category?.id) return;
    productAPI.getAll({ limit: "5", category: String(product.category.id), sort: "newest" })
      .then(({ data }) => {
        const list = data?.products || data?.data || [];
        setRelated(list.filter((p: RelatedProduct) => p.id !== product.id).slice(0, 4));
      })
      .catch(() => {});
  }, [product]);

  const addToCart = async () => {
    if (!product) return;
    try {
      await cartAPI.addItem({ product_id: product.id, quantity });
      toast.success("Added to cart!");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error?: string } } }).response?.data?.error || "Failed to add"
          : "Failed to add";
      toast.error(msg);
    }
  };

  const addToWishlist = async () => {
    if (!product || !isAuthenticated) {
      toast.error("Please sign in first");
      return;
    }
    try {
      await userAPI.addToWishlist(product.id);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  if (loading) return <PageLoader text="Loading product..." />;

  if (!product) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#333] mb-4">Product Not Found</h1>
        <Link href="/products" className="text-[#c96] hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ id: 0, image_url: "", is_primary: true }];
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const avgRating = product.reviews?.length
    ? Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length)
    : 0;

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <AnimateOnScroll type="fadeIn" duration={400}>
      <nav className="flex items-center gap-2 text-xs text-[#999] mb-8 flex-wrap">
        <Link href="/" className="hover:text-[#c96] transition-colors">Home</Link>
        <ChevronRight size={12} className="shrink-0" />
        <Link href="/products" className="hover:text-[#c96] transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <Link href={`/products?category=${product.category.id}`} className="hover:text-[#c96] transition-colors">{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={12} className="shrink-0" />
        <span className="text-[#333] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>
      </AnimateOnScroll>

      {/* Main Section */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Images */}
        <AnimateOnScroll type="slideUp" duration={600}>
        <div>
          <div className="aspect-square bg-[#f4f4f4] rounded-lg overflow-hidden mb-3 relative group">
            {images[selectedImage]?.image_url ? (
              <>
                <img
                  src={images[selectedImage].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#ccc]">No image</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#ef837b] text-white text-xs font-bold px-2.5 py-1 rounded-sm shadow-md">
                -{discount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-md border-2 overflow-hidden shrink-0 transition-all duration-200 ${
                    idx === selectedImage ? "border-[#c96] shadow-sm" : "border-[#ebebeb] hover:border-[#ccc]"
                  }`}
                >
                  {img.image_url ? (
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
        </AnimateOnScroll>

        {/* Info */}
        <AnimateOnScroll type="slideUp" duration={600}>
        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/products?category=${product.category.id}`}
              className="text-xs text-[#c96] uppercase tracking-widest mb-2 hover:underline self-start"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-[#333] mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={avgRating} />
              <span className="text-xs text-[#999]">({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-[#c96]">${Number(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <>
                <span className="text-lg text-[#999] line-through">${Number(product.compare_price).toFixed(2)}</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-sm">Save ${(product.compare_price - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#666] leading-relaxed mb-6 line-clamp-3">{product.description}</p>

          {/* Divider */}
          <div className="border-t border-[#ebebeb] mb-6" />

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#999]">SKU</span>
              <span className="text-[#333] font-medium">{product.sku || "—"}</span>
            </div>
            {product.vendor && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#999]">Sold by</span>
                <span className="text-[#333] font-medium">{product.vendor.store_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#999]">Availability</span>
              {product.stock_qty > 0 ? (
                <span className="text-green-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                  In Stock
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Stock Bar */}
          {product.stock_qty > 0 && (
            <div className="mb-6">
              <StockBar stock={product.stock_qty} />
            </div>
          )}

          {/* Quantity + Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[#ebebeb] rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2.5 text-sm hover:bg-[#f4f4f4] transition-colors border-r border-[#ebebeb]"
              >
                -
              </button>
              <span className="px-5 py-2.5 text-sm font-medium min-w-[44px] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                className="px-3.5 py-2.5 text-sm hover:bg-[#f4f4f4] transition-colors border-l border-[#ebebeb]"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={product.stock_qty === 0}
              className="flex-1 bg-[#c96] text-white py-3.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#b8865a] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ShoppingBag size={17} />
              Add to Cart
            </button>
            <button
              onClick={addToWishlist}
              className="border border-[#ebebeb] px-4 py-3.5 rounded-md hover:text-[#c96] hover:border-[#c96] transition-colors"
              title="Add to wishlist"
            >
              <Heart size={17} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }
              }}
              className="border border-[#ebebeb] px-4 py-3.5 rounded-md hover:text-[#c96] hover:border-[#c96] transition-colors"
              title="Share"
            >
              <Share2 size={17} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-[#ebebeb]">
            <div className="text-center">
              <Truck size={20} className="mx-auto mb-1.5 text-[#c96]" />
              <p className="text-[10px] text-[#999] font-medium uppercase tracking-wide">Free Shipping</p>
            </div>
            <div className="text-center">
              <ShieldCheck size={20} className="mx-auto mb-1.5 text-[#c96]" />
              <p className="text-[10px] text-[#999] font-medium uppercase tracking-wide">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw size={20} className="mx-auto mb-1.5 text-[#c96]" />
              <p className="text-[10px] text-[#999] font-medium uppercase tracking-wide">30 Day Returns</p>
            </div>
          </div>
        </div>
        </AnimateOnScroll>
      </div>

      {/* Tabs: Description / Reviews */}
      <AnimateOnScroll type="fadeIn" duration={500}>
      <div className="mb-16">
        <div className="border-b border-[#ebebeb] flex gap-0">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === "description" ? "text-[#c96]" : "text-[#666] hover:text-[#333]"
            }`}
          >
            Description
            {activeTab === "description" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c96]" />}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === "reviews" ? "text-[#c96]" : "text-[#666] hover:text-[#333]"
            }`}
          >
            Reviews {product.reviews ? `(${product.reviews.length})` : ""}
            {activeTab === "reviews" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c96]" />}
          </button>
        </div>

        <div className="py-8">
          {activeTab === "description" ? (
            <div className="text-[#555] leading-relaxed text-sm">
              {product.description ? (
                product.description.split("\n").map((line, i) => (
                  <p key={i} className="mb-3 last:mb-0">{line || "\u00A0"}</p>
                ))
              ) : (
                <p className="text-[#999] italic">No description available.</p>
              )}
            </div>
          ) : (
            <div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-[#ebebeb] last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#f4f4f4] flex items-center justify-center text-xs font-bold text-[#666] uppercase shrink-0">
                          {review.user?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#333]">{review.user?.name || "Anonymous"}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size={12} />
                            <span className="text-[10px] text-[#999]">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-sm font-semibold text-[#333] mb-1">{review.title}</p>
                      )}
                      {review.comment && (
                        <p className="text-sm text-[#666] leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star size={32} className="mx-auto mb-3 text-[#ddd]" />
                  <p className="text-sm text-[#999]">No reviews yet for this product.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </AnimateOnScroll>

      {/* Related Products */}
      {related.length > 0 && (
        <AnimateOnScroll type="fadeIn" duration={500}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#333]">Related Products</h2>
            {product.category && (
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-sm text-[#c96] hover:underline"
              >
                View All
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
        </AnimateOnScroll>
      )}
    </div>
  );
}
