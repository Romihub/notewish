// Template System Types

// Media Layout Configuration
export interface MediaLayout {
  // Positioning
  position?: 'background' | 'inline' | 'side' | 'floating';
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'full';
  
  // Styling
  rounded?: boolean;
  controls?: boolean;  // For video/audio elements
  opacity?: number;
  
  // Animation
  animate?: boolean;
  animationType?: 'fade' | 'zoom' | 'slide' | 'flip';
}

// Template Content (for new animated templates)
export interface TemplateContent {
  // Text content
  text: string;
  title?: string;
  
  // Media
  image?: string;
  video?: string;
  music?: string;  // Background music (auto-play, loop, hidden)
  voice?: string;  // Voice message (visible controls)
  
  // Layout options
  imageLayout?: MediaLayout;
  videoLayout?: MediaLayout;
  voiceLayout?: MediaLayout;
}

export type TemplateCategory =
  | "birthday"
  | "anniversary"
  | "wedding"
  | "thank-you"
  | "graduation"
  | "christmas"
  | "new-year"
  | "valentines"
  | "easter"
  | "mothers-day"
  | "fathers-day"
  | "get-well"
  | "sympathy"
  | "baby-shower"
  | "congratulations"
  | "general";

export type TemplateStyle =
  | "modern"
  | "minimalist"
  | "vintage"
  | "elegant"
  | "playful"
  | "professional"
  | "artistic"
  | "rustic"
  | "luxury"
  | "casual"
  | "bold"
  | "soft"
  | "abstract"
  | "geometric";

export type TemplateMood =
  | "happy"
  | "romantic"
  | "formal"
  | "fun"
  | "heartfelt"
  | "inspiring"
  | "peaceful"
  | "energetic"
  | "nostalgic"
  | "celebratory"
  | "sentimental"
  | "humorous"
  | "sincere"
  | "uplifting";

export type TemplateTag = 
  | TemplateCategory
  | TemplateStyle
  | TemplateMood
  | string;

export interface TemplateRenderer {
  setPage: (page: number) => void;
  getTotalPages: () => number;
}

// Template Props - what every template receives
export interface TemplateProps {
  // Card Metadata
  cardId: string;
  title?: string;
  occasion: string;
  recipientName: string;
  greetings?: string;
  personalMessage?: string;
  senderName?: string;
  
  // Generated Content (All Optional)
  message?: string;              // Single message (first variation)
  messageVariations?: string[];  // Multiple message variations (5)
  imageUrl?: string;             // From ImageGenerator
  voiceUrl?: string;             // From VoiceGenerator
  musicUrl?: string;             // Background music (invisible, auto-play)
  songUrl?: string;              // Generated song (visible player)
  songTitle?: string;            // Song title for player
  videoUrl?: string;             // From VideoGenerator
  
  // Template Configuration
  templateId: string;
  customizations?: TemplateCustomizations;
  
  // Interaction Mode
  mode?: "preview" | "view" | "edit" | "render";
  
  // For server-side rendering/video generation
  renderer?: TemplateRenderer;
}

export interface TemplateCustomizations {
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  accentColor?: string;
  enableAnimations?: boolean;
  autoPlayMusic?: boolean;
}

// Template Metadata - stored in Firestore
export interface TemplateMetadata {
  // Core Identity
  id: string;
  name: string;
  description: string;
  
  // Organization
  category: TemplateCategory;
  subcategory?: string;
  folder: string;
  componentPath: string;
  
  // Tagging System
  tags: TemplateTag[];
  
  // Supported Features
  supports: {
    message: boolean;
    image: boolean;
    voice: boolean;
    music: boolean;
    video: boolean;
  };
  
  // Visual Properties
  style: TemplateStyle;
  colorScheme: string[];
  mood: TemplateMood[];
  
  // Preview & Display
  thumbnail: string;
  previewVideo?: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
  
  // Metadata
  isPremium: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  
  // Analytics
  views: number;
  uses: number;
  rating: number;
  ratingCount: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Creator Info
  createdBy: string;
  version: string;
}

// Filter Interface
export interface TemplateFilters {
  categories?: TemplateCategory[];
  tags?: string[];
  allTags?: string[];
  styles?: TemplateStyle[];
  moods?: TemplateMood[];
  supportsMessage?: boolean;
  supportsImage?: boolean;
  supportsVoice?: boolean;
  supportsMusic?: boolean;
  supportsVideo?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  searchQuery?: string;
  sortBy?: "popular" | "newest" | "rating" | "name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
