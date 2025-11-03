import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export interface CardAssets {
  message?: string;
  messageVariations?: string[];  // Array of 5 message variations
  imageUrl?: string;
  voiceUrl?: string;
  musicUrl?: string;             // Background music (invisible)
  songUrl?: string;              // Generated song (visible player)
  songTitle?: string;            // Song title
  videoUrl?: string;
}

export interface CardData {
  id: string;
  title: string;
  occasion: string;
  recipientName: string;
  greetings?: string;
  personalMessage: string;
  templateId: string;
  assets: CardAssets;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload audio file to Firebase Storage from URL or data URL
 */
export async function uploadMusicToStorage(
  cardId: string,
  audioUrl: string
): Promise<string> {
  try {
    let blob: Blob;
    
    // Check if it's a data URL (base64) or regular URL
    if (audioUrl.startsWith('data:')) {
      blob = dataURLtoBlob(audioUrl);
    } else {
      // Fetch the audio from the URL
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');
      blob = await response.blob();
    }
    
    const timestamp = Date.now();
    const storageRef = ref(storage, `cards/${cardId}/music_${timestamp}.mp3`);
    
    await uploadBytes(storageRef, blob, {
      contentType: 'audio/mpeg',
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading music to storage:', error);
    throw error;
  }
}

/**
 * Upload image to Firebase Storage from URL or data URL
 */
export async function uploadImageToStorage(
  cardId: string,
  imageUrl: string | any
): Promise<string> {
  try {
    // Validate and normalize imageUrl
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    // Convert to string if it's not already
    const urlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl);
    console.log('�� [UPLOAD] Starting upload for:', urlString.substring(0, 100) + '...');
    
    let blob: Blob;
    
    // Check if it's a data URL (base64) or regular URL
    if (urlString.startsWith('data:')) {
      console.log('📤 [UPLOAD] Converting base64 data URL to blob');
      blob = dataURLtoBlob(urlString);
    } else {
      // Fetch the image from the URL with proper CORS mode
      console.log('📤 [UPLOAD] Fetching image from URL...');
      const response = await fetch(urlString, {
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'image/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Get blob with proper content type
      blob = await response.blob();
      console.log('📤 [UPLOAD] Fetched blob:', blob.type, blob.size, 'bytes');
      
      // Ensure it's actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }
    }
    
    const timestamp = Date.now();
    // Use proper file extension based on blob type
    const extension = blob.type === 'image/png' ? 'png' : 'jpg';
    const storageRef = ref(storage, `cards/${cardId}/image_${timestamp}.${extension}`);
    
    console.log('📤 [UPLOAD] Uploading to Firebase Storage...');
    await uploadBytes(storageRef, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    });
    
    console.log('📤 [UPLOAD] Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('📤 [UPLOAD] ✅ Upload successful!', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('📤 [UPLOAD] ❌ Upload failed:', error);
    console.error('📤 [UPLOAD] Error details:', error.message);
    throw error;
  }
}

/**
 * Upload voice audio to Firebase Storage
 */
export async function uploadVoiceToStorage(
  cardId: string,
  audioUrl: string
): Promise<string> {
  try {
    let blob: Blob;
    
    // Check if it's a data URL (base64) or regular URL
    if (audioUrl.startsWith('data:')) {
      blob = dataURLtoBlob(audioUrl);
    } else {
      // Fetch the audio from the URL
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');
      blob = await response.blob();
    }
    
    const timestamp = Date.now();
    const storageRef = ref(storage, `cards/${cardId}/voice_${timestamp}.mp3`);
    
    await uploadBytes(storageRef, blob, {
      contentType: 'audio/mpeg',
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading voice to storage:', error);
    throw error;
  }
}

/**
 * Upload video to Firebase Storage
 */
export async function uploadVideoToStorage(
  cardId: string,
  videoUrl: string
): Promise<string> {
  try {
    let blob: Blob;
    
    // Check if it's a data URL (base64) or regular URL
    if (videoUrl.startsWith('data:')) {
      blob = dataURLtoBlob(videoUrl);
    } else {
      // Fetch the video from the URL
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error('Failed to fetch video');
      blob = await response.blob();
    }
    
    const timestamp = Date.now();
    const storageRef = ref(storage, `cards/${cardId}/video_${timestamp}.mp4`);
    
    await uploadBytes(storageRef, blob, {
      contentType: 'video/mp4',
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading video to storage:', error);
    throw error;
  }
}

/**
 * Save card data to Firestore
 */
export async function saveCardToFirestore(cardData: CardData): Promise<void> {
  try {
    const cardRef = doc(db, 'cards', cardData.id);
    await setDoc(cardRef, {
      ...cardData,
      createdAt: cardData.createdAt,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving card to Firestore:', error);
    throw error;
  }
}

/**
 * Update card assets in Firestore
 */
export async function updateCardAssets(
  cardId: string,
  assets: Partial<CardAssets>
): Promise<void> {
  try {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, {
      assets,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating card assets:', error);
    throw error;
  }
}

/**
 * Get card data from Firestore
 */
export async function getCardFromFirestore(cardId: string): Promise<CardData | null> {
  try {
    const cardRef = doc(db, 'cards', cardId);
    const cardSnap = await getDoc(cardRef);
    
    if (cardSnap.exists()) {
      return cardSnap.data() as CardData;
    }
    return null;
  } catch (error) {
    console.error('Error getting card from Firestore:', error);
    throw error;
  }
}

/**
 * Get all cards from Firestore (for current user)
 */
export async function getAllCardsFromFirestore(): Promise<CardData[]> {
  try {
    const { getDocs, query, orderBy } = await import('firebase/firestore');
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const cards: CardData[] = [];
    querySnapshot.forEach((doc) => {
      cards.push(doc.data() as CardData);
    });
    
    return cards;
  } catch (error) {
    console.error('Error getting all cards from Firestore:', error);
    throw error;
  }
}

/**
 * Delete card from Firestore
 */
export async function deleteCardFromFirestore(cardId: string): Promise<void> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const cardRef = doc(db, 'cards', cardId);
    await deleteDoc(cardRef);
  } catch (error) {
    console.error('Error deleting card from Firestore:', error);
    throw error;
  }
}
