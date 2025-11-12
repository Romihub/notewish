# Remotion Prop Forwarding Issue - Root Cause Analysis

## The Problem

```
[REMOTION-SERVER] ✅ Card loaded successfully → cardData exists ✅
[COMPOSITION] cardData received: null → cardData is null ❌
```

## Root Cause

The issue is in how Remotion handles dynamic props. Looking at the code:

### In `remotion-server.js`:
```javascript
// Line 105-110: selectComposition
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps: { cardId, cardData },  // ❌ These props are NOT forwarded to render
});

// Line 119-129: renderMedia
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  inputProps: { cardId, cardData },  // ❌ These ARE forwarded but...
});
```

### In `Root.tsx`:
```typescript
<Composition
  id="CardVideo"
  component={CardComposition}
  durationInFrames={300}  // ❌ HARDCODED - should be dynamic
  defaultProps={{
    cardId: '',
    cardData: null,       // ❌ This overrides inputProps!
  }}
/>
```

## The Issue

**Remotion's prop resolution order:**
1. `defaultProps` in `<Composition>` (defines the schema)
2. `inputProps` in `renderMedia()` (runtime values)
3. BUT: If `defaultProps` has `null`, and no `calculateMetadata` is used, the null value might persist

## The Solution

We need to use Remotion's `calculateMetadata` function to dynamically set props and composition metadata based on the card data.

### Fix 1: Make Composition Dynamic with calculateMetadata

```typescript
// Root.tsx
<Composition
  id="CardVideo"
  component={CardComposition}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    cardId: '',
    cardData: null,
  }}
  calculateMetadata={async ({ props, defaultProps }) => {
    // Props passed via inputProps will be here
    const { cardData } = props;
    
    if (!cardData || !cardData.pages) {
      return {
        props,
        durationInFrames: 300,
        fps: 30,
      };
    }
    
    // Calculate total duration from pages
    const totalFrames = cardData.pages.reduce((total, page) => {
      return total + Math.round((page.duration || 5) * 30);
    }, 0);
    
    return {
      props,
      durationInFrames: totalFrames,
      fps: 30,
    };
  }}
/>
```

### Fix 2: Alternative - Remove defaultProps and use schema

```typescript
// Root.tsx - Let inputProps be the source of truth
<Composition
  id="CardVideo"
  component={CardComposition}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  // No defaultProps - inputProps will be used directly
/>
```

## Why This Happens

Remotion separates:
1. **Composition Selection Phase** - reads defaultProps + calculateMetadata
2. **Rendering Phase** - merges defaultProps + inputProps

The bug: Without `calculateMetadata`, Remotion doesn't know to override the `null` defaultProps with the actual `inputProps` values.

## Verification Needed

Add this debug to `CardComposition.tsx`:
```typescript
export const CardComposition: React.FC<CardCompositionProps> = (props) => {
  console.log('[COMPOSITION] ALL PROPS:', props);
  console.log('[COMPOSITION] Keys:', Object.keys(props));
  
  const { cardData } = props;
  // ...rest
```

This will show us if props are being passed but not destructured correctly.
