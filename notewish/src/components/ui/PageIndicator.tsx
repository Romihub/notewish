"use client";

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export function PageIndicator({ currentPage, totalPages }: PageIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentPage
              ? "w-8 bg-purple-500"
              : "w-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
