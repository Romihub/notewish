import { GreetingCard } from "./components/GreetingCard";

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <GreetingCard
        coverImage="https://images.unsplash.com/photo-1611152695823-3570672b4142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGFubml2ZXJzYXJ5JTIwZmxvd2Vyc3xlbnwxfHx8fDE3NjA3Mzc0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        title="Happy Anniversary 💞"
        message="Through every season, every moment, and every heartbeat, my love for you grows deeper. Here's to the beautiful journey we've shared and all the memories yet to come. Forever yours, always."
      />
    </div>
  );
}
