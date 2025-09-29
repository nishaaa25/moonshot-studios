/**
 * Font loading utilities to prevent GSAP SplitText from running before fonts are ready
 */

export class FontLoader {
  constructor() {
    this.fontsLoaded = false;
    this.loadingPromise = null;
    this.callbacks = [];
  }

  async waitForFonts() {
    if (this.fontsLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadFonts();
    return this.loadingPromise;
  }

  async loadFonts() {
    try {
      // Check if FontFace API is available
      if ('fonts' in document) {
        // Wait for fonts to be ready
        await document.fonts.ready;
        
        // Double-check specific fonts are loaded
        const fontChecks = [
          new FontFace('Montserrat', 'url(/font/Montserrat.ttf)', { display: 'swap' }),
          new FontFace('PPTelegraf', 'url(/font/PPTelegraf-Regular.otf)', { weight: '400', display: 'swap' }),
          new FontFace('PPTelegraf', 'url(/font/PPTelegraf-Ultralight.otf)', { weight: '100', display: 'swap' }),
          new FontFace('PPTelegraf', 'url(/font/PPTelegraf-Ultrabold.otf)', { weight: '800', display: 'swap' })
        ];

        // Load all fonts
        const loadPromises = fontChecks.map(async (font) => {
          try {
            await font.load();
            document.fonts.add(font);
            return true;
          } catch (error) {
            console.warn(`Failed to load font: ${font.family}`, error);
            return false;
          }
        });

        await Promise.allSettled(loadPromises);
        
        // Additional wait to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Fallback for browsers without FontFace API
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            setTimeout(resolve, 500); // Give fonts time to load
          } else {
            window.addEventListener('load', () => {
              setTimeout(resolve, 500);
            });
          }
        });
      }

      this.fontsLoaded = true;
      this.callbacks.forEach(callback => callback());
      this.callbacks = [];
      
      console.log('Fonts loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Still mark as loaded to prevent infinite waiting
      this.fontsLoaded = true;
      this.callbacks.forEach(callback => callback());
      this.callbacks = [];
      return false;
    }
  }

  onFontsReady(callback) {
    if (this.fontsLoaded) {
      callback();
    } else {
      this.callbacks.push(callback);
      if (!this.loadingPromise) {
        this.waitForFonts();
      }
    }
  }

  // Check if a specific font is loaded
  isFontLoaded(fontFamily, text = 'A') {
    if (!('fonts' in document)) return true; // Assume loaded if no API

    try {
      return document.fonts.check(`12px ${fontFamily}`, text);
    } catch (error) {
      return true; // Assume loaded if check fails
    }
  }
}

// Singleton instance
export const fontLoader = new FontLoader();

// Auto-start font loading
fontLoader.waitForFonts();

export default fontLoader;
