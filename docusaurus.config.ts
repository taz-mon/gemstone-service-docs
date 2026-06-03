import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'GemStone Systems',
  tagline: 'Object-oriented database platform documentation',
  favicon: 'img/favicon.ico',

  url: 'https://taz-mon.github.io',
  baseUrl: '/gemstone-service-docs/',

  organizationName: 'taz-mon',
  projectName: 'gemstone-service-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
  hooks: {
    onBrokenMarkdownLinks: 'warn',
  },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'GemStone Systems',
      logo: {
        alt: 'GemStone Systems Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://taz-mon.github.io/tazdocs-as-code/docs/my-docs/resume/',
          label: 'About the Author',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Platform Overview', to: '/docs/getting-started/platform-overview'},
            {label: 'Quick Start', to: '/docs/getting-started/quick-start'},
            {label: 'Transactions & Concurrency', to: '/docs/core-concepts/transactions'},
            {label: 'Object Security', to: '/docs/reference/object-security'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GemTalk Systems',
              href: 'https://gemtalksystems.com',
            },
            {
              label: 'Official Programmer\'s Guide',
              href: 'https://downloads.gemtalksystems.com/docs/GemStone64/3.2.x/GS64-ProgGuide-3.2/GS64-ProgGuide-3.2.htm',
            },
          ],
        },
        {
          title: 'Writing Sample',
          items: [
            {
              label: 'Taz-docs-as-code resume',
              href: 'https://taz-mon.github.io/tazdocs-as-code/docs/my-docs/resume/',
            },
            {
              label: 'Other writing samples',
              href: 'https://taz-mon.github.io/tazdocs-as-code/docs/my-docs/resume/',
            },
          ],
        },
      ],
      copyright: `Writing sample — Tom "Taz" Aciukewicz. Built with Docusaurus. I used Claude to customize the CSS to match GemTalk System's web look and feel.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['smalltalk', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
