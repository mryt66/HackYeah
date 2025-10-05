/**
 * Konfiguracja dostępności zgodnie z WCAG 2.2
 * 
 * Ten plik zawiera konfigurację dla zapewnienia dostępności aplikacji
 * zgodnie z wymogami specyfikacji.
 */

export interface AccessibilityConfig {
  highContrastMode: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  highContrastMode: false,
  fontSize: 'normal',
  keyboardNavigation: true,
  screenReaderSupport: true
};

/**
 * Klasy CSS dla wysokiego kontrastu
 */
export const HIGH_CONTRAST_CLASS = 'high-contrast-mode';

/**
 * Rozmiary czcionek zgodne z WCAG
 */
export const FONT_SIZES = {
  normal: '16px',
  large: '18px',
  'extra-large': '20px'
};
