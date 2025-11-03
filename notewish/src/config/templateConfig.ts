// Template Configuration - Scalable Modular Approach
// Uses template presets + database loading for thousands of templates

export type GeneratorType = 'message' | 'image' | 'voice' | 'video' | 'music';

export interface TemplateConfig {
  name: string;
  description: string;
  requiredGenerators: GeneratorType[];
  optionalGenerators: GeneratorType[];
}

// ========================================
// TEMPLATE PRESETS (DRY Principle)
// ========================================
// Define common patterns that templates inherit from
export const TEMPLATE_PRESETS: Record<string, Omit<TemplateConfig, 'name' | 'description'>> = {
  // Preset 1: Text + Images only (most common)
  'text-image': {
    requiredGenerators: ['message', 'image'],
    optionalGenerators: []
  },

  // Preset 2: Full multimedia
  'full-media': {
    requiredGenerators: ['message'],
    optionalGenerators: ['image', 'voice', 'video', 'music']
  },

  // Preset 3: Video-focused
  'video-centric': {
    requiredGenerators: ['message', 'video'],
    optionalGenerators: ['music']
  },

  // Preset 4: Audio-focused
  'audio-centric': {
    requiredGenerators: ['message'],
    optionalGenerators: ['voice', 'music']
  },

  // Preset 5: Minimal (message only)
  'minimal': {
    requiredGenerators: ['message'],
    optionalGenerators: []
  },

  // Add more presets as needed...
};

// ========================================
// LOCAL TEMPLATE OVERRIDES
// ========================================
// Only store templates that need custom config
// Most templates will use presets
export const TEMPLATE_OVERRIDES: Record<string, TemplateConfig> = {
  'flipbook-mini': {
    name: 'Flipbook Mini',
    description: 'Compact flipbook card',
    ...TEMPLATE_PRESETS['text-image'] // Inherit from preset
  },

  // Only add templates here if they need custom generator combos
};

// ========================================
// DATABASE LOADER (For scalability)
// ========================================
/**
 * Loads template config from Firestore
 * Falls back to presets if not found
 */
async function loadTemplateFromDatabase(templateId: string): Promise<TemplateConfig | null> {
  try {
    // In production, fetch from Firestore:
    // const templateDoc = await getDoc(doc(firestore, 'templates', templateId));
    // if (templateDoc.exists()) {
    //   return templateDoc.data() as TemplateConfig;
    // }
    
    return null;
  } catch (error) {
    console.error('Error loading template config:', error);
    return null;
  }
}

// ========================================
// MAIN API
// ========================================

/**
 * Get template configuration (with caching)
 * Priority: Local Override > Database > Preset inference > Default
 */
const configCache = new Map<string, TemplateConfig>();

export async function getTemplateConfig(templateId: string): Promise<TemplateConfig> {
  // Check cache
  if (configCache.has(templateId)) {
    return configCache.get(templateId)!;
  }

  // 1. Check local overrides
  if (TEMPLATE_OVERRIDES[templateId]) {
    configCache.set(templateId, TEMPLATE_OVERRIDES[templateId]);
    return TEMPLATE_OVERRIDES[templateId];
  }

  // 2. Try loading from database
  const dbConfig = await loadTemplateFromDatabase(templateId);
  if (dbConfig) {
    configCache.set(templateId, dbConfig);
    return dbConfig;
  }

  // 3. Infer from template ID pattern (smart defaults)
  const inferredConfig = inferConfigFromTemplateId(templateId);
  configCache.set(templateId, inferredConfig);
  return inferredConfig;
}

/**
 * Infer template config from template ID naming convention
 * Examples:
 * - "birthday-video-2024" -> video-centric preset
 * - "wedding-minimal-card" -> minimal preset
 * - "anniversary-full" -> full-media preset
 */
function inferConfigFromTemplateId(templateId: string): TemplateConfig {
  const id = templateId.toLowerCase();

  // Pattern matching for smart defaults
  if (id.includes('video') || id.includes('vid')) {
    return {
      name: templateId,
      description: 'Video template',
      ...TEMPLATE_PRESETS['video-centric']
    };
  }

  if (id.includes('voice') || id.includes('audio') || id.includes('sound')) {
    return {
      name: templateId,
      description: 'Audio template',
      ...TEMPLATE_PRESETS['audio-centric']
    };
  }

  if (id.includes('minimal') || id.includes('simple')) {
    return {
      name: templateId,
      description: 'Minimal template',
      ...TEMPLATE_PRESETS['minimal']
    };
  }

  if (id.includes('flipbook') || id.includes('photo') || id.includes('picture')) {
    return {
      name: templateId,
      description: 'Image-focused template',
      ...TEMPLATE_PRESETS['text-image']
    };
  }

  // Default: full media support
  return {
    name: templateId,
    description: 'Full media template',
    ...TEMPLATE_PRESETS['full-media']
  };
}

/**
 * Get allowed generators for a template
 */
export async function getAllowedGenerators(templateId: string): Promise<GeneratorType[]> {
  const config = await getTemplateConfig(templateId);
  return [...config.requiredGenerators, ...config.optionalGenerators];
}

/**
 * Check if a generator is allowed (sync version for UI)
 */
export function isGeneratorAllowedSync(
  config: TemplateConfig, 
  generatorId: GeneratorType
): boolean {
  const allowed = [...config.requiredGenerators, ...config.optionalGenerators];
  return allowed.includes(generatorId);
}

/**
 * Check if a generator is required (sync version for UI)
 */
export function isGeneratorRequiredSync(
  config: TemplateConfig,
  generatorId: GeneratorType
): boolean {
  return config.requiredGenerators.includes(generatorId);
}

/**
 * Clear config cache (useful for testing or when templates update)
 */
export function clearConfigCache() {
  configCache.clear();
}

// ========================================
// FIRESTORE SCHEMA (For reference)
// ========================================
/*
Collection: templates
Document: {templateId}
{
  id: string;
  name: string;
  description: string;
  category: string;
  presetId?: string; // Optional: inherit from preset
  requiredGenerators: GeneratorType[];
  optionalGenerators: GeneratorType[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
*/
