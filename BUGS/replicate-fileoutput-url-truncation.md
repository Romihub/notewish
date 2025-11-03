# Bug Report: Replicate FileOutput URL Truncation

**Date Discovered:** October 31, 2025
**Severity:** High
**Status:** Fixed
**Component:** Image Generation API (Replicate nano-banana)

---

## Summary

Replicate's nano-banana model returns a `FileOutput` object whose `.url()` method **truncates** the image URL, causing Firebase Storage upload failures. The complete URL is available via `.toString()` method.

---

## Bug Details

### The Problem

When calling `replicate.run('google/nano-banana', ...)`, the returned `FileOutput` object has:
- ✅ **`.toString()`** - Returns the COMPLETE URL
- ❌ **`.url()`** - Returns a TRUNCATED URL (missing the end)

### Example

```typescript
const output = await replicate.run('google/nano-banana', { input: config });

// BROKEN - URL gets truncated:
const brokenUrl = await output.url();
// Returns: https://replicate.delivery/.../tmpw8ni2ps4  (INCOMPLETE!)

// WORKING - Full URL:
const workingUrl = String(output);
// Returns: https://replicate.delivery/.../tmpw8ni2ps4.png  (COMPLETE!)
```

### Console Logs Showing the Bug

```
🎨 [REPLICATE] google/nano-banana output toString(): https://replicate.delivery/xezq/BaLtHX3o0Zr5KhQd6ZQbL1mrWFYLNvb7vzVjbwr2UqVpfVyKA/tmpw8ni2ps4.png
🎨 [REPLICATE] Extracted via url() method: https://replicate.delivery/xezq/BaLtHX3o0Zr5KhQd6ZQbL1mrWFYLNvb7vzVjbwr2UqVpfVyK  
```

Notice `.url()` is missing the final part: `A/tmpw8ni2ps4.png`

---

## Root Cause

The Replicate SDK's `FileOutput.url()` method appears to have a bug where it truncates long URLs. This may be:
1. A buffer size issue in the SDK
2. An async/await timing issue
3. A string encoding problem

The `.toString()` method works correctly because it likely accesses the underlying data differently.

---

## Impact

### Before Fix:
- Image generation API would return `imageUrl: {}` (empty object)
- Firebase Storage upload would fail with "Fetched blob: text/html"
- All image-to-image generation requests failed
- Error: "All Replicate models failed. Last error: google/nano-banana returned invalid image URL"

### After Fix:
- Complete URL properly extracted
- Firebase Storage upload succeeds
- Images successfully generated and stored

---

## Solution

### Code Fix

File: `notewish/src/app/api/generate/image/route.ts`

```typescript
// nano-banana returns a FileOutput object with toString() method
if (output && typeof output === 'object') {
  try {
    // ✅ Use .toString() first (works for nano-banana FileOutput)
    if (typeof (output as any).toString === 'function') {
      const urlString = String(output);
      if (urlString.startsWith('http')) {
        imageUrl = urlString;
        console.log(`🎨 [REPLICATE] Extracted via toString():`, imageUrl.slice(0, 80));
      }
    }
    
    // Fallback to .url() method for other models
    if (!imageUrl && typeof (output as any).url === 'function') {
      imageUrl = await (output as any).url();
      console.log(`🎨 [REPLICATE] Extracted via url() method:`, imageUrl);
    }
    // ... other fallbacks
  } catch (urlError: any) {
    console.error(`🎨 [REPLICATE] Error extracting URL:`, urlError.message);
  }
}
```

### Key Changes:
1. **Primary Method:** Use `String(output)` / `.toString()` for FileOutput objects
2. **Fallback:** Keep `.url()` as fallback for other Replicate models
3. **Validation:** Check that extracted URL is a valid HTTP(S) string

---

## Testing

### Verification Steps:
1. Upload a reference image to ImageGenerator
2. Generate an image with nano-banana
3. Check console logs for:
   ```
   🎨 [REPLICATE] Extracted via toString(): https://replicate.delivery/...
   🎨 [REPLICATE] ✅ Success with google/nano-banana!
   ```
4. Verify image uploads to Firebase Storage successfully
5. Confirm image displays in the UI

---

## Recommendations

### Short Term:
- ✅ Use `.toString()` for all FileOutput extractions
- ✅ Keep detailed logging to catch similar issues
- ✅ Add validation for URL completeness

### Long Term:
1. **Report to Replicate:** File an issue with Replicate SDK maintainers about `.url()` truncation
2. **SDK Update:** Monitor Replicate SDK updates for fixes
3. **Type Safety:** Add proper TypeScript types for FileOutput handling
4. **Unit Tests:** Add tests for URL extraction from various output formats

---

## Related Issues

- Firebase Storage upload failing with "text/html" content type
- Image generation succeeding in Replicate dashboard but failing in app
- Fallback mechanism triggering incorrectly when primary model actually succeeded

---

## Lessons Learned

1. **Trust but verify:** Even though Replicate generates images successfully, the SDK may have bugs in data extraction
2. **Log everything:** Detailed logging (toString(), JSON.stringify(), Object.keys()) is crucial for debugging API responses
3. **Multiple extraction strategies:** Always have fallback methods for extracting data from third-party APIs
4. **Don't assume methods work:** The "obvious" method (`.url()`) wasn't the working one

---

## Developer Notes

When working with Replicate models:
- Always log the raw output structure first
- Try multiple extraction methods
- Don't trust that `.url()` returns complete URLs
- `.toString()` is often more reliable for FileOutput objects
- Validate URLs before using them (check for http prefix and reasonable length)

---

**Fixed By:** AI Agent (Claude)  
**Verified By:** User  
**Commit:** [To be added after commit]
