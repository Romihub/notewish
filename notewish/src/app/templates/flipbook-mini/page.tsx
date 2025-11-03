"use client";

import FlipbookMiniTemplate from "@/components/templates/general/FlipbookMini";

export default function FlipbookMiniPreviewPage() {
  // Sample data for testing
  const sampleData = {
    cardId: "test-card-123",
    title: "Happy Birthday!",
    occasion: "birthday",
    recipientName: "Sarah",
    senderName: "John",
    templateId: "general-flipbook-mini-01",
    messageVariations: [
      "Wishing you a day filled with happiness and a year filled with joy. Happy birthday!",
      "May your birthday be the start of a year filled with good luck, good health and much happiness.",
      "Another adventure filled year awaits you. Welcome it by celebrating your birthday with pomp and splendor.",
      "Hope your special day brings you all that your heart desires! Here's wishing you a day full of pleasant surprises!",
      "May this birthday be just the beginning of a year filled with happy memories, wonderful moments and shining dreams."
    ],
    // Sample music URL (optional background music)
    musicUrl: undefined, // Set to URL for invisible background music
    // Sample song URL (visible Spotify-like player)
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    songTitle: "Happy Birthday Song",
    mode: "view" as const
  };

  return (
    <div className="w-full h-screen">
      <FlipbookMiniTemplate {...sampleData} />
    </div>
  );
}
