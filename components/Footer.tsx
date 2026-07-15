import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold">FreshLock</span>
            </div>
            <p className="text-gray-300 text-sm">
              Keep food fresh longer with Australia's favourite handheld vacuum sealer.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=devices" className="text-gray-300 hover:text-white transition">
                  Vacuum Sealers
                </Link>
              </li>
              <li>
                <Link href="/products?category=bags" className="text-gray-300 hover:text-white transition">
                  Vacuum Bags
                </Link>
              </li>
              <li>
                <Link href="/products?category=kits" className="text-gray-300 hover:text-white transition">
                  Kits & Bundles
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} FreshLock Australia. All rights reserved.</p>
            <p className="mt-2 md:mt-0">ABN: 12 345 678 901</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
