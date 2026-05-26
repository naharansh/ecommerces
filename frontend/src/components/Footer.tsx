import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#222] text-[#999] text-sm">
      {/* Icon boxes */}
      <div className="border-b border-[#333]">
        <div className="max-w-[1260px] mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl mb-2">🚚</div>
            <h4 className="text-white font-medium text-sm mb-1">Free Shipping</h4>
            <p className="text-xs">Orders over $50</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="text-white font-medium text-sm mb-1">Free Returns</h4>
            <p className="text-xs">Within 30 days</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💰</div>
            <h4 className="text-white font-medium text-sm mb-1">20% Off</h4>
            <p className="text-xs">First order</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💬</div>
            <h4 className="text-white font-medium text-sm mb-1">24/7 Support</h4>
            <p className="text-xs">Live chat or phone</p>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-[#333] py-8">
        <div className="max-w-[1260px] mx-auto px-4 text-center">
          <h3 className="text-white text-lg font-medium mb-2">Subscribe to Our Newsletter</h3>
          <p className="text-xs mb-4">Get the latest updates on new products and upcoming sales</p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              className="min-w-0 flex-1 px-4 py-2.5 text-sm bg-[#333] border border-[#444] text-white rounded-l focus:outline-none focus:border-[#c96]"
            />
            <button className="bg-[#c96] text-white px-4 md:px-6 py-2.5 text-sm font-medium rounded-r hover:bg-[#b8865a] transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1260px] mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-medium mb-4">About ShopWave</h4>
          <p className="text-xs leading-relaxed">
            ShopWave is your premier destination for quality products at unbeatable prices. We offer a curated selection of items across multiple categories.
          </p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Information</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Customer Service</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition-colors">Payment Methods</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Returns</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">My Account</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">View Cart</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
            <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#333] py-4">
        <div className="max-w-[1260px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
          <p>&copy; {new Date().getFullYear()} ShopWave. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
