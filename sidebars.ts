import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsible: false,
      items: [
        'getting-started/platform-overview',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsible: false,
      items: [
        'reference/object-security',
      ],
    },
  ],
};

export default sidebars;
