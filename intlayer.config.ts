import { type IntlayerConfig, Locales } from 'intlayer';

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.POLISH, Locales.ENGLISH],
    defaultLocale: Locales.POLISH,
  },
};

export default config;
