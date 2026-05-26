import Link from "next/link";

const banners = [
  {
    title: "Coffee Tables",
    subtitle: "Starting at $79",
    image: "/assets/images/demos/demo-2/banners/banner-1.jpg",
  },
  {
    title: "Armchairs",
    subtitle: "Up to 30% off",
    image: "/assets/images/demos/demo-2/banners/banner-2.jpg",
  },
  {
    title: "Storage Boxes",
    subtitle: "From $29",
    image: "/assets/images/demos/demo-2/banners/banner-3.jpg",
  },
  {
    title: "Lamps",
    subtitle: "Flash Sale",
    image: "/assets/images/demos/demo-2/banners/banner-4.jpg",
  },
];

export default function BannerGrid() {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {banners.map((banner, idx) => (
          <Link
            key={idx}
            href="/products"
            className="relative rounded-sm overflow-hidden group aspect-[4/5] block"
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <h3 className="text-white font-semibold text-sm group-hover:text-[#c96] transition-colors">
                {banner.title}
              </h3>
              <p className="text-[#c96] text-xs mt-1">{banner.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
