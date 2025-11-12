"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCardFromFirestore, CardData } from "@/lib/storage";
import { getTemplateComponent } from "@/lib/templateRegistry";
import { TemplateRenderer } from "@/types/template";

export default function RenderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cardId = params?.cardId as string;
  const page = parseInt(searchParams.get('page') || '0', 10);
  
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [TemplateComponent, setTemplateComponent] = useState<any>(null);
  const [renderer, setRenderer] = useState<TemplateRenderer>({
    setPage: (p: number) => {},
    getTotalPages: () => 0,
  });

  useEffect(() => {
    if (cardId) {
      // Reset ready flag on card change
      (window as any).isReady = false;
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

  // Signal to Puppeteer when the component is fully rendered
  useEffect(() => {
    if (cardData && TemplateComponent) {
      // Use a timeout to ensure the DOM has settled after the state update
      const timer = setTimeout(() => {
        (window as any).isReady = true;
      }, 500); // 500ms delay for safety
      return () => clearTimeout(timer);
    }
  }, [cardData, TemplateComponent]);

  useEffect(() => {
    if (renderer && renderer.setPage) {
      renderer.setPage(page);
    }
  }, [page, renderer]);

  if (!cardData || !TemplateComponent) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <p>Loading card...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <TemplateComponent {...cardData.assets} {...cardData} mode="render" renderer={renderer} initialPage={page} />
    </div>
  );
}
