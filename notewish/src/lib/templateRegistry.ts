/**
 * Template Registry System
 * Dynamically loads template components without hardcoding switch cases
 * Scalable to 10,000+ templates
 */

import { ComponentType } from 'react';
import { TemplateProps } from '@/types/template';

// Template component map
const templateComponents: Record<string, () => Promise<{ default: ComponentType<TemplateProps> }>> = {
  'general-flipbook-mini-01': () => import('@/components/templates/general/FlipbookMini'),
  'general-cinematic-story-01': () => import('@/components/templates/general/CinematicStory'),
  // Add more templates here as they're created
  // 'birthday-animated-01': () => import('@/components/templates/birthday/AnimatedBirthday'),
  // 'wedding-elegant-01': () => import('@/components/templates/wedding/ElegantWedding'),
  // ... up to 10,000+ templates
};

/**
 * Get template component by templateId
 * Uses dynamic imports for code splitting (only loads what's needed)
 */
export async function getTemplateComponent(templateId: string): Promise<ComponentType<TemplateProps> | null> {
  const loader = templateComponents[templateId];
  
  if (!loader) {
    console.error(`Template "${templateId}" not found in registry`);
    return null;
  }
  
  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load template "${templateId}":`, error);
    return null;
  }
}

/**
 * Check if template exists in registry
 */
export function templateExists(templateId: string): boolean {
  return templateId in templateComponents;
}

/**
 * Get all registered template IDs
 */
export function getAllTemplateIds(): string[] {
  return Object.keys(templateComponents);
}
