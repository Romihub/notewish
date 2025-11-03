import { FlipbookCard } from "./components/FlipbookCard";

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <FlipbookCard
        coverImage="https://images.unsplash.com/photo-1720192651131-447a95a3dd78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMGZsb3dlcnMlMjBnaWZ0fGVufDF8fHx8MTc2MDc2NDYxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        title="Celebrate With Me 🌸"
        messageText="Every moment with you is a treasure I hold close to my heart. Through laughter and tears, adventures and quiet evenings, you make every day brighter. Thank you for being you."
        videoThumbnail="https://images.unsplash.com/photo-1611152695823-3570672b4142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGFubml2ZXJzYXJ5JTIwZmxvd2Vyc3xlbnwxfHx8fDE3NjA3Mzc0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />
    </div>
  );
}