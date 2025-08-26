export type Locale = (typeof locales)[number];

export const locales = ['en', 'de','te','hi','me','fr'] as const;
export const defaultLocale: Locale = 'en';
