"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCardFromFirestore, CardData } from "@/lib/storage";
import { getTemplateComponent } from "@/lib/templateRegistry";

export default function RenderPage() {
  const params = useParams();
  const cardId = params?.cardId as string;
  
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [TemplateComponent, setTemplateComponent] = useState<any>(null);

  useEffect(() => {
    if (cardId) {
      loadCardAndTemplate();
    }
  }, [cardId]);

  const loadCardAndTemplate = async () => {
    const data = await getCardFromFirestore(cardId);
    if (data) {
      setCardData(data);
      const component = await getTemplateComponent(data.templateId);
      if (component) {
        setTemplateComponent(() => component);
      }
    }
  };

  if (!cardData || !TemplateComponent) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <p>Loading card...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <TemplateComponent {...cardData.assets} {...cardData} mode="render" />
    </div>
  );
}
