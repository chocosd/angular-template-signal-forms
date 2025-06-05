import { DOCUMENT } from '@angular/common';
import {
  effect,
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  Provider,
  signal,
} from '@angular/core';
import {
  type SignalFormConfig,
  type SignalFormContainer,
} from '../models/signal-form.model';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SignalFormsThemeConfig {
  darkMode?: boolean;
  defaultTheme?: ThemeMode;
}

export const SIGNAL_FORMS_THEME_CONFIG =
  new InjectionToken<SignalFormsThemeConfig>('SIGNAL_FORMS_THEME_CONFIG');

/**
 * Provider function for Signal Forms theme configuration
 * @param config - Theme configuration options
 * @returns Provider array for Angular DI
 */
export function provideSignalFormsTheme(
  config: SignalFormsThemeConfig = {},
): Provider[] {
  return [
    {
      provide: SIGNAL_FORMS_THEME_CONFIG,
      useValue: config,
    },
    SignalFormThemeService,
  ];
}

/**
 * Theme Service for Signal Forms
 *
 * Provides centralized theme management for the form system.
 * Manages global theme state and applies theme classes to the HTML element.
 *
 * This service is a singleton that coordinates theme across all forms in the app.
 * When any form requests a theme check, it determines the root form's theme
 * and applies the appropriate class to the HTML element.
 */
@Injectable({
  providedIn: 'root',
})
export class SignalFormThemeService {
  private _theme = signal<ThemeMode>('auto');
  private _isDarkMode = signal<boolean>(false);

  /**
   * Current theme mode setting for the service
   */
  public readonly theme = this._theme.asReadonly();

  /**
   * Whether dark mode is currently active based on system preference
   */
  public readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Optional()
    @Inject(SIGNAL_FORMS_THEME_CONFIG)
    private config: SignalFormsThemeConfig | null,
  ) {
    // Use default empty config if none provided
    const themeConfig = this.config || {};

    // Set initial theme from config
    if (themeConfig.defaultTheme) {
      this._theme.set(themeConfig.defaultTheme);
    }

    // Initialize dark mode based on system preference
    if (typeof window !== 'undefined') {
      this._isDarkMode.set(
        window.matchMedia('(prefers-color-scheme: dark)').matches,
      );

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        this._isDarkMode.set(e.matches);
      });
    }

    // Auto-apply dark mode if configured
    if (themeConfig.darkMode) {
      effect(() => {
        this.updateGlobalDarkMode();
      });
    }
  }

  /**
   * Set the global theme mode
   * @param theme - 'light', 'dark', or 'auto'
   */
  public setTheme(theme: ThemeMode): void {
    this._theme.set(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  public toggleTheme(): void {
    const current = this._theme();
    if (current === 'auto') {
      // If auto, switch to opposite of current system preference
      this.setTheme(this._isDarkMode() ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setTheme(current === 'dark' ? 'light' : 'dark');
    }
  }

  /**
   * Check theme for any form configuration and trigger HTML class updates
   * This method determines the effective theme but doesn't return it for binding
   * Instead, it triggers side effects to update the global HTML classes
   *
   * @param formOrConfig - Form container or form config
   */
  public checkTheme<TModel>(
    formOrConfig: SignalFormContainer<TModel> | SignalFormConfig<TModel>,
  ): void {
    const effectiveTheme = this.getEffectiveTheme(formOrConfig);
    this.updateHtmlClasses(effectiveTheme);
  }

  /**
   * Apply global dark mode based on service theme setting
   * Used when darkMode is enabled in provider config
   */
  private updateGlobalDarkMode(): void {
    const effectiveTheme = this.getServiceEffectiveTheme();
    this.updateHtmlClasses(effectiveTheme);
  }

  /**
   * Get the effective theme for any form configuration
   * Recursively finds the root form and uses its theme setting
   *
   * @param formOrConfig - Form container or form config
   * @returns 'light' or 'dark'
   */
  private getEffectiveTheme<TModel>(
    formOrConfig: SignalFormContainer<TModel> | SignalFormConfig<TModel>,
  ): 'light' | 'dark' {
    let config: SignalFormConfig<TModel>;

    // Handle both form containers and configs
    if ('config' in formOrConfig) {
      // It's a form container - check if it has a parent
      const form = formOrConfig as SignalFormContainer<TModel>;
      const parentForm = form.parentForm?.();

      if (parentForm) {
        // Not root, recurse to parent
        return this.getEffectiveTheme(parentForm);
      }

      config = form.config;
    } else {
      // It's a config object
      config = formOrConfig as SignalFormConfig<TModel>;
    }

    // We're at the root - determine theme
    const themeMode = config.theme ?? 'light';

    if (themeMode === 'dark') {
      return 'dark';
    }
    if (themeMode === 'light') {
      return 'light';
    }

    // Auto mode - use service theme or fall back to system preference
    return this.getServiceEffectiveTheme();
  }

  /**
   * Get the effective theme from the service (resolves 'auto' to 'light' or 'dark')
   */
  private getServiceEffectiveTheme(): 'light' | 'dark' {
    const theme = this._theme();
    if (theme === 'auto') {
      return this._isDarkMode() ? 'dark' : 'light';
    }
    return theme;
  }

  /**
   * Update HTML classes based on effective theme
   * @param effectiveTheme - The theme to apply
   */
  private updateHtmlClasses(effectiveTheme: 'light' | 'dark'): void {
    // Safe to use injected document - will be null in headless environments
    if (!this.document?.documentElement) {
      return;
    }

    const html = this.document.documentElement;

    // Remove existing theme classes
    html.classList.remove('dark-themed-forms', 'light-themed-forms');

    // Add new theme class
    if (effectiveTheme === 'dark') {
      html.classList.add('dark-themed-forms');
    } else {
      html.classList.add('light-themed-forms');
    }
  }
}
