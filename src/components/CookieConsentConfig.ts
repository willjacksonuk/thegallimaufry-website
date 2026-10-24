/* Source: https://daniel.es/blog/the-ultimate-astro-google-analytics-guide */

import type { CookieConsentConfig } from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag: (...args: any[]) => void;
    // Defined in AnalyticsConsent.astro
    grantAnalytics: () => void;
    denyAnalytics: () => void;
  }
}

export const config: CookieConsentConfig = {
  root: '#cc-container',
  guiOptions: {
    consentModal: {
      layout: 'box inline',
      position: 'bottom left',
    },
    preferencesModal: {
      layout: 'box',
      position: 'right',
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: {
      readOnly: true,
    },
    analytics: {
      services: {
        ga4: {
          label: 'Google Analytics',
          onAccept: () => window.grantAnalytics(),
          onReject: () => window.denyAnalytics(),
          cookies: [
            { name: /^_ga/ },
          ],
        },
      },
    },
  },
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'A Brief Word on Cookies',
          description:
            'We use Google Analytics to see how people find and use this site — things like which pages are visited and how long people spend on them. The data is anonymous and used only to improve the site. We don\'t run ads or sell or share data for advertising.',
          acceptAllBtn: 'Accept',
          acceptNecessaryBtn: 'Decline',
        },
        preferencesModal: {
          title: 'Cookie Preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Decline all',
          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close',
          sections: [
            {
              title: 'Strictly Necessary',
              description:
                'The contact form uses Cloudflare Turnstile to check that messages come from people rather than spam bots. It sets no tracking cookies and is only used to protect the form.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Analytics Cookies',
              description:
                'Google Analytics helps us understand how visitors find and use the site. All data is anonymous. We don\'t use it for advertising or sell or share it with anyone.',
              linkedCategory: 'analytics',
            },
          ],
        },
      },
    },
  },
};