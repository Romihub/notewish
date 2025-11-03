import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { dataURLtoBlob } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { cardId, imageUrl } = await request.json();

    if (!cardId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'cardId and imageUrl are required' },
        { status: 400 }
      );
    }

    console.log('📤 [UPLOAD API] Starting upload for card:', cardId);

    let blob: Blob;

    if (imageUrl.startsWith('data:')) {
      console.log('📤 [UPLOAD API] Converting base64 data URL to blob');
      blob = dataURLtoBlob(imageUrl);
    } else {
      console.log('📤 [UPLOAD API] Fetching image from URL:', imageUrl.substring(0, 100));
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      blob = await response.blob();
    }

    console.log('📤 [UPLOAD API] Fetched blob:', blob.type, blob.size, 'bytes');

    if (!blob.type.startsWith('image/')) {
      throw new Error(`Invalid image type: ${blob.type}`);
    }

    const timestamp = Date.now();
    const extension = blob.type.split('/')[1] || 'jpg';
    const storageRef = ref(storage, `cards/${cardId}/image_${timestamp}.${extension}`);

    console.log('📤 [UPLOAD API] Uploading to Firebase Storage...');
    await uploadBytes(storageRef, blob, {
      contentType: blob.type,
      cacheControl: 'public, max-age=31536000',
    });

    const downloadURL = await getDownloadURL(storageRef);
    console.log('📤 [UPLOAD API] ✅ Upload successful!', downloadURL);

    return NextResponse.json({ success: true, permanentUrl: downloadURL });

  } catch (error: any) {
    console.error('📤 [UPLOAD API] ❌ Upload failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
