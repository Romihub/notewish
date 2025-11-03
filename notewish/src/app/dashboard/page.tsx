"use client";

import Link from "next/link";

export default function Dashboard() {
  const categories = [
    { icon: "🎂", label: "Birthday" },
    { icon: "💕", label: "Anniversary" },
    { icon: "🌸", label: "Get Well Soon" },
    { icon: "🎉", label: "Congratulations" },
    { icon: "🙏", label: "Thank You" },
  ];

  const featuredCards = [
    {
      title: "Birthday",
      subtitle: "Create a birthday wish",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
    },
    {
      title: "Get Well Soon",
      subtitle: "Send a healing message",
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
    },
    {
      title: "Happy Wedding",
      subtitle: "Celebrate their special day",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    },
  ];

  const featuredTemplates = [
    {
      title: "Vibrant Birthday Blast",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=400&fit=crop",
    },
    {
      title: "Elegant Floral Congrats",
      image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&h=400&fit=crop",
    },
    {
      title: "Soothing Pastel Thoughts",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=400&fit=crop",
    },
    {
      title: "Golden Anniversary",
      image: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=300&h=400&fit=crop",
    },
  ];

  const trendingCreations = [
    {
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop",
    },
    {
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    },
    {
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
    },
    {
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
    },
    {
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-inter)]">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-gray-100 border-r border-gray-200 p-6 flex flex-col fixed h-screen">
        {/* Logo Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
              NoteWish
            </h1>
            <p className="text-xs text-gray-500 font-[family-name:var(--font-inter)]">
              Create & Share
            </p>
          </div>
        </div>

        {/* Create Button */}
        <Link href="/create">
          <button className="w-full bg-gray-900 text-white border-none rounded-lg py-3 px-6 text-sm font-medium mb-8 hover:bg-gray-800 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            + Create New
          </button>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 mb-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white text-gray-900 font-medium transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Explore</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-sm">Feeds</span>
          </Link>

          <Link href="/templates" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-sm">Templates</span>
          </Link>
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-300 my-4"></div>

        {/* Creation & Storage Section */}
        <nav className="flex flex-col gap-1 mb-6">
          <Link href="/creations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm">My Creations</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm">Folders</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Assets</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">Favorites</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm">Notifications</span>
          </Link>
        </nav>

        {/* Bottom Navigation */}
        <div className="mt-auto pt-4 border-t border-gray-300 flex flex-col gap-1 mb-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm">Profile</span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm">Help & Support</span>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 font-[family-name:var(--font-inter)]">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <p className="text-gray-400 mt-2">© 2025 NoteWish</p>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 ml-64 overflow-y-auto p-8 bg-white">
        
        {/* Top Cards - Ads & How-to */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Longer Ad Card */}
            <div className="col-span-2 relative h-48 rounded-2xl overflow-hidden cursor-pointer group border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop"
                alt="Featured Ad"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/70 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
              <div className="relative h-full p-8 flex flex-col justify-between z-10">
                <div>
                  <div className="text-purple-300 text-xs font-semibold mb-2 font-[family-name:var(--font-poppins)]">
                    FEATURED
                  </div>
                  <div className="text-white text-4xl font-bold leading-tight mb-3 font-[family-name:var(--font-poppins)]">
                    Create Magic Moments
                  </div>
                  <div className="text-purple-100 text-sm font-[family-name:var(--font-inter)]">
                    Transform your thoughts into beautiful digital cards
                  </div>
                </div>
                <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300">
                  <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Shorter How-to/FAQ Card */}
            <Link href="/dashboard">
              <div className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br from-indigo-500 to-purple-600 border border-gray-200">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_white_2px,_transparent_2px)] bg-[size:30px_30px]"></div>
                <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M50,30 L50,55 M50,65 L50,70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                <div className="relative h-full p-6 flex flex-col justify-center items-center text-center z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-white text-xl font-bold mb-2 font-[family-name:var(--font-poppins)]">
                    How to Get Started
                  </div>
                  <div className="text-indigo-100 text-sm font-[family-name:var(--font-inter)]">
                    Tips & Tutorials
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Top Creations | Community Feeds | Search Box */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              <Link href="/creations">
                <button className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors font-[family-name:var(--font-poppins)]">
                  Top Creations
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors font-[family-name:var(--font-poppins)]">
                  Community Feeds
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors font-[family-name:var(--font-poppins)]">
                  Follows
                </button>
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search creations..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 px-4 pl-11 focus:outline-none focus:border-purple-500 transition-colors font-[family-name:var(--font-inter)]"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Start Creating Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-[family-name:var(--font-poppins)]">
            Start Creating
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <Link href="/create">
              <div className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group">
                <img 
                  src={featuredCards[0].image} 
                  alt={featuredCards[0].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/90 via-blue-900/70 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                  <div>
                    <div className="text-cyan-300 text-xs font-semibold mb-2 font-[family-name:var(--font-poppins)]">
                      QUICK START
                    </div>
                    <div className="text-white text-4xl font-bold leading-tight mb-3 font-[family-name:var(--font-poppins)]">
                      {featuredCards[0].title}
                    </div>
                    <div className="text-cyan-100 text-sm font-[family-name:var(--font-inter)]">
                      {featuredCards[0].subtitle}
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300">
                    <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>

            {/* Banner 2 */}
            <Link href="/create">
              <div className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group">
                <img 
                  src={featuredCards[1].image} 
                  alt={featuredCards[1].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-red-900/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                  <div>
                    <div className="text-orange-300 text-xs font-semibold mb-2 font-[family-name:var(--font-poppins)]">
                      FEATURED
                    </div>
                    <div className="text-white text-4xl font-bold leading-tight mb-3 font-[family-name:var(--font-poppins)]">
                      {featuredCards[1].title}
                    </div>
                    <div className="text-orange-100 text-sm font-[family-name:var(--font-inter)]">
                      {featuredCards[1].subtitle}
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300">
                    <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Feature Cards - Featured Templates */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
              Featured Templates
            </h2>
            <Link href="/templates">
              <button className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors font-[family-name:var(--font-poppins)]">
                View all →
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTemplates.map((template, idx) => (
              <Link href="/create" key={idx}>
                <div className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group">
                  {idx === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 z-0">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                    </div>
                  )}
                  {idx === 1 && (
                    <>
                      <img 
                        src={template.image}
                        alt={template.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-transparent"></div>
                    </>
                  )}
                  {idx === 2 && (
                    <>
                      <img 
                        src={template.image}
                        alt={template.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/60 to-transparent"></div>
                    </>
                  )}
                  {idx === 3 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 z-0">
                      <svg className="absolute top-0 right-0 w-24 h-24 opacity-10" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/>
                        <path d="M30,50 L50,30 L70,50 L50,70 Z" fill="white"/>
                      </svg>
                    </div>
                  )}
                  <div className="relative h-full p-5 flex flex-col justify-between z-10">
                    <div>
                      <div className={`text-xs font-semibold mb-2 font-[family-name:var(--font-poppins)] ${
                        idx === 0 ? 'text-emerald-200' : 
                        idx === 1 ? 'text-blue-200' : 
                        idx === 2 ? 'text-indigo-200' : 
                        'text-purple-200'
                      }`}>
                        [{idx === 0 ? 'New' : idx === 1 ? 'Popular' : idx === 2 ? 'Trending' : 'Premium'}]
                      </div>
                      <div className="text-white text-lg font-bold leading-tight mb-1.5 font-[family-name:var(--font-poppins)]">
                        {template.title.split(' ').slice(0, 2).join(' ')}
                      </div>
                      <div className={`text-xs font-[family-name:var(--font-inter)] ${
                        idx === 0 ? 'text-emerald-200' : 
                        idx === 1 ? 'text-blue-200' : 
                        idx === 2 ? 'text-indigo-200' : 
                        'text-purple-200'
                      }`}>
                        {template.title.split(' ').slice(2).join(' ')}
                      </div>
                    </div>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300">
                      <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Gallery - Trending Creations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
              Trending Creations
            </h2>
            <Link href="/creations">
              <button className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors font-[family-name:var(--font-poppins)]">
                Explore more →
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingCreations.map((creation, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group">
                <img 
                  src={creation.image}
                  alt={`Trending ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
