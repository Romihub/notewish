import { motion } from "motion/react";

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export function PageIndicator({ currentPage, totalPages }: PageIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full transition-all"
          animate={{
            width: i === currentPage ? "32px" : "8px",
            height: "8px",
            backgroundColor:
              i === currentPage
                ? "rgba(167, 139, 250, 0.9)"
                : "rgba(167, 139, 250, 0.3)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ))}
      <span
        className="ml-2 text-sm text-purple-400/80"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
}
