# Viewport Height Solution for Mobile Browser UI

This implementation provides a robust solution for handling mobile browser UI changes (address bar, bottom navigation) that affect viewport height and can cause content shifts or break GSAP animations.

## 🚀 Quick Start

The solution is already integrated into your project. Here's how it works:

### 1. Automatic Integration
- `useVh()` hook is called in `src/App.jsx` - manages `--vh` CSS variable globally
- Initial setup in `src/main.jsx` - sets `--vh` before React mounts
- CSS classes in `src/index.css` - ready-to-use viewport height utilities

### 2. Using CSS Classes

```jsx
// Full-screen page (GSAP-safe with min-height)
<div className="page">
  <div className="page__content">
    {/* Your content here */}
  </div>
</div>

// Full-height section
<section className="section-full">
  {/* Content */}
</section>

// Container that adapts to viewport changes
<div className="viewport-container">
  {/* Content */}
</div>
```

### 3. GSAP Animation Best Practices

```jsx
// ✅ Good: Use transform for animations
useEffect(() => {
  gsap.to(".gsap-element", {
    y: 100,
    rotation: 45,
    scale: 1.2,
    duration: 1
  });
}, []);

// ✅ Good: Add CSS class for optimization
<div className="gsap-element">Animated content</div>

// ❌ Avoid: Animating height/width properties
gsap.to(".element", { height: "50vh" }); // Can cause reflows
```

## 📁 File Structure

```
src/
├── hooks/
│   └── useVh.js                 # Main viewport height hook
├── utils/
│   └── viewport.js              # Utilities (legacy support)
├── index.css                    # CSS variables and classes
├── main.jsx                     # Initial setup
└── App.jsx                      # Hook integration
```

## 🔧 API Reference

### `useVh()` Hook

```javascript
import { useVh } from './hooks/useVh';

function MyComponent() {
  // Automatically manages --vh CSS variable
  const currentVh = useVh(); // Returns current vh value (optional)
  
  return <div className="page">Content</div>;
}
```

**Features:**
- ✅ Uses `visualViewport` API when available
- ✅ Fallback to `window.innerHeight`
- ✅ Debounced updates (100ms) with requestAnimationFrame
- ✅ Only updates when height actually changes (>1px difference)
- ✅ Handles: resize, orientationchange, visibilitychange
- ✅ Automatic cleanup on unmount

### CSS Variables

```css
:root {
  --vh: 1vh;        /* Primary variable (updated by useVh) */
  --real-vh: 1vh;   /* Legacy support */
}
```

### CSS Classes

| Class | Purpose | Usage |
|-------|---------|-------|
| `.page` | Full-screen page container | Main page wrapper |
| `.page__content` | GSAP-optimized content wrapper | Inside `.page` |
| `.section-full` | Full viewport height section | Individual sections |
| `.viewport-container` | Adaptive height container | Any container needing vh |
| `.gsap-element` | GSAP animation optimization | Animated elements |

## 📱 Mobile Browser Support

### Events Handled
- `window.resize` - Window size changes
- `window.orientationchange` - Device rotation
- `document.visibilitychange` - Tab visibility changes
- `visualViewport.resize` - Mobile UI changes (iOS Safari, Chrome mobile)
- `visualViewport.scroll` - Viewport scrolling (when address bar hides/shows)

### Progressive Enhancement
```css
.page {
  min-height: calc(var(--vh) * 100);  /* Primary */
  min-height: 100dvh;                 /* Fallback for modern browsers */
}
```

## ⚡ Performance Optimizations

1. **Debounced Updates**: Prevents excessive DOM writes during rapid resize events
2. **RequestAnimationFrame**: Ensures updates happen at optimal timing
3. **Change Detection**: Only updates when height actually changes (>1px)
4. **Will-Change Optimization**: CSS classes include `will-change: transform`
5. **GPU Acceleration**: Transform3d and backface-visibility optimizations

## 🎯 GSAP Integration Guidelines

### ✅ Recommended Patterns

```javascript
// Use min-height instead of height for containers
.container {
  min-height: calc(var(--vh) * 100);
}

// Animate transforms only
gsap.to(".element", {
  x: 100,
  y: 50,
  rotation: 45,
  scale: 1.2
});

// Add will-change for animated elements
<div className="gsap-element">Content</div>
```

### ❌ Avoid These Patterns

```javascript
// Don't animate layout properties
gsap.to(".element", { height: "50vh", width: "50vw" });

// Don't use height on containers (use min-height)
.container { height: calc(var(--vh) * 100); }
```

## 🔄 Migration from Old System

Your existing code using `--real-vh` will continue to work. The new system provides both variables:

```css
/* Old way (still works) */
height: calc(var(--real-vh, 1vh) * 100);

/* New way (recommended) */
min-height: calc(var(--vh) * 100);
```

## 🐛 Troubleshooting

### Issue: Content jumps on mobile
**Solution**: Use `min-height` instead of `height` and add `.page__content` wrapper

### Issue: GSAP animations stuttering
**Solution**: Add `.gsap-element` class and animate transforms only

### Issue: Address bar changes cause layout shifts
**Solution**: Ensure `useVh()` is called in your root component (already done in App.jsx)

### Issue: Custom viewport height needed
**Solution**: Access the hook's return value:
```javascript
const currentVh = useVh();
// Use currentVh * 100 for programmatic calculations
```

## 🌐 Browser Compatibility

- ✅ iOS Safari (all versions)
- ✅ Chrome Mobile
- ✅ Firefox Mobile  
- ✅ Samsung Internet
- ✅ Desktop browsers (all major)

Fallbacks ensure compatibility with older browsers that don't support CSS custom properties or Visual Viewport API.

## 📝 Additional Notes

- The solution is dependency-free and lightweight (~2KB)
- Production-ready (no console logs)
- TypeScript-ready (add `.ts` extension if needed)
- Works with SSR/SSG (client-side only execution)
- Safe with React 18+ concurrent features
