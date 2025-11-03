"use client";

import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
              NoteWish
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium font-[family-name:var(--font-poppins)]">
                Sign In
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors font-[family-name:var(--font-poppins)]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="py-20 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-poppins)]">
            Create Beautiful Digital Cards
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-[family-name:var(--font-inter)]">
            Transform your thoughts into stunning digital greeting cards with AI-powered creativity. Share moments that matter.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-20">
            <Link href="/dashboard">
              <button className="px-8 py-4 text-lg bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors shadow-lg hover:shadow-xl font-[family-name:var(--font-poppins)]">
                See Pricing
              </button>
            </Link>
            <Link href="/create">
              <button className="px-8 py-4 text-lg bg-white text-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-50 font-semibold transition-colors font-[family-name:var(--font-poppins)]">
                Start Creating
              </button>
            </Link>
          </div>

          {/* Preview Image Placeholder */}
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl shadow-2xl flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 font-[family-name:var(--font-inter)]">Preview of NoteWish Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 border-t border-gray-200">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16 font-[family-name:var(--font-poppins)]">
            Why Choose NoteWish?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
                AI-Powered Creation
              </h3>
              <p className="text-gray-600 font-[family-name:var(--font-inter)]">
                Generate beautiful cards with AI assistance for images, text, and music
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
                Beautiful Templates
              </h3>
              <p className="text-gray-600 font-[family-name:var(--font-inter)]">
                Choose from hundreds of professionally designed templates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
                Easy Sharing
              </h3>
              <p className="text-gray-600 font-[family-name:var(--font-inter)]">
                Share your creations instantly with anyone, anywhere
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20 border-t border-gray-200">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4 font-[family-name:var(--font-poppins)]">
            Simple Pricing
          </h2>
          <p className="text-center text-gray-600 mb-16 font-[family-name:var(--font-inter)]">
            Start free, upgrade when you need more
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">$0</span>
                <span className="text-gray-600 font-[family-name:var(--font-inter)]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 font-[family-name:var(--font-inter)]">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 cards per month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic templates
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Standard sharing
                </li>
              </ul>
              <Link href="/dashboard">
                <button className="w-full py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold transition-colors font-[family-name:var(--font-poppins)]">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-purple-600 rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold font-[family-name:var(--font-poppins)]">
                Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">$9</span>
                <span className="text-gray-600 font-[family-name:var(--font-inter)]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 font-[family-name:var(--font-inter)]">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited cards
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All premium templates
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-powered features
                </li>
              </ul>
              <Link href="/dashboard">
                <button className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors font-[family-name:var(--font-poppins)]">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Team Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">Team</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">$29</span>
                <span className="text-gray-600 font-[family-name:var(--font-inter)]">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 font-[family-name:var(--font-inter)]">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Team collaboration
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link href="/dashboard">
                <button className="w-full py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold transition-colors font-[family-name:var(--font-poppins)]">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900 font-[family-name:var(--font-poppins)]">NoteWish</span>
              </div>
              <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                Create beautiful digital cards with AI
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-[family-name:var(--font-poppins)]">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                <li><Link href="/templates" className="hover:text-gray-900">Templates</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link href="/create" className="hover:text-gray-900">Create</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-[family-name:var(--font-poppins)]">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                <li><Link href="/" className="hover:text-gray-900">About</Link></li>
                <li><Link href="/" className="hover:text-gray-900">Blog</Link></li>
                <li><Link href="/" className="hover:text-gray-900">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-[family-name:var(--font-poppins)]">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                <li><Link href="/" className="hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-gray-900">Terms of Service</Link></li>
                <li><Link href="/" className="hover:text-gray-900">Help & Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600 font-[family-name:var(--font-inter)]">
            © 2025 NoteWish. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
