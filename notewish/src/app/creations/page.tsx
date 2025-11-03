"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAllCardsFromFirestore, deleteCardFromFirestore, CardData } from "@/lib/storage";

export default function CreationsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOccasion, setFilterOccasion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "occasion">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const allCards = await getAllCardsFromFirestore();
      setCards(allCards);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCardFromFirestore(cardId);
      setCards(cards.filter(c => c.id !== cardId));
      toast.success("Card deleted successfully");
      setShowDeleteModal(false);
      setCardToDelete(null);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Failed to delete card");
    }
  };

  const handleReuseTemplate = (card: CardData) => {
    router.push(`/create/${card.templateId}?reuse=true`);
    toast.success("Reusing template...");
  };

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOccasion = filterOccasion === "all" || card.occasion === filterOccasion;
      return matchesSearch && matchesOccasion;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "occasion":
          return a.occasion.localeCompare(b.occasion);
        default:
          return 0;
      }
    });

  const occasions = Array.from(new Set(cards.map(c => c.occasion)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/create" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Templates
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
                My Creations ({filteredCards.length})
              </h1>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Card
            </Link>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-[family-name:var(--font-inter)]"
              />
            </div>

            {/* Filter by Occasion */}
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-[family-name:var(--font-inter)]"
            >
              <option value="all">All Occasions</option>
              {occasions.map(occasion => (
                <option key={occasion} value={occasion}>{occasion}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name" | "occasion")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-[family-name:var(--font-inter)]"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="occasion">Sort by Occasion</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid/List */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
              No cards found
            </h3>
            <p className="text-gray-600 mb-6 font-[family-name:var(--font-inter)]">
              {searchQuery || filterOccasion !== "all" 
                ? "Try adjusting your filters" 
                : "Create your first card to get started"}
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Card
            </Link>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Card Preview */}
                <div 
                  onClick={() => router.push(`/preview/${card.id}`)}
                  className="aspect-video bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 relative cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <h3 className="text-white text-2xl font-bold text-center mb-2 font-[family-name:var(--font-playfair)]">
                      {card.occasion}
                    </h3>
                    {card.recipientName && (
                      <p className="text-white/90 text-sm">For {card.recipientName}</p>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-medium text-gray-700 rounded-full">
                      View Card
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 font-[family-name:var(--font-poppins)] truncate">
                    {card.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-[family-name:var(--font-inter)]">
                    Updated {card.updatedAt instanceof Date 
                      ? card.updatedAt.toLocaleDateString()
                      : new Date((card.updatedAt as any).seconds * 1000).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/preview/${card.id}`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/create/${card.templateId}?cardId=${card.id}`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <div className="relative group/more">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-10">
                        <button
                          onClick={() => handleReuseTemplate(card)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                        >
                          Reuse Template
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/preview/${card.id}`);
                            toast.success('Link copied to clipboard!');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => window.open(`/preview/${card.id}`, '_blank')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          View in New Tab
                        </button>
                        <button
                          onClick={() => {
                            setCardToDelete(card.id);
                            setShowDeleteModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
                Delete Card?
              </h3>
              <p className="text-gray-600 mb-6 font-[family-name:var(--font-inter)]">
                Are you sure you want to delete this card? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCardToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => cardToDelete && handleDeleteCard(cardToDelete)}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
