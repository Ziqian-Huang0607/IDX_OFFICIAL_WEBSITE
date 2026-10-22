// src/data/links.ts
export interface ExternalResource {
  name: string;
  description: string;
  category: string;
  url: string;
  color: string; // Used for a glowing effect
}

export interface EcosystemLink {
  label: string;
  url: string;
  primary?: boolean; // Filled accent style instead of outline
}

export interface EcosystemTool {
  name: string;
  maker: string; // e.g. 'by IDX' or 'by PA Tech'
  makerLogo?: string; // Optional image shown instead of the maker text
  tagline: string;
  description: string;
  url: string;
  icon: string;
  accent: string; // Hex color used for the card glow effect
  links?: EcosystemLink[]; // Overrides the default single "Open Site" action
}

export const externalLinks: ExternalResource[] = [
  {
    name: 'Desmos',
    description: 'Advanced graphing calculator for algebra and calculus.',
    category: 'Mathematics',
    url: 'https://www.desmos.com/calculator',
    color: '#2d70b3'
  },
  {
    name: 'Seterra',
    description: 'Geography games to learn countries, capitals, and flags.',
    category: 'Geography',
    url: 'https://www.geoguessr.com/seterra/',
    color: '#ff9f43'
  },
  {
    name: 'Khan Academy',
    description: 'Comprehensive video tutorials for all subjects.',
    category: 'All Subjects',
    url: 'https://www.khanacademy.org',
    color: '#14bf96'
  },
  {
    name: 'Quizlet',
    description: 'Flashcards and study sets for vocabulary and memorization.',
    category: 'General',
    url: 'https://quizlet.com',
    color: '#4257b2'
  },
  {
    name: 'IDX SHSID CC Advisor',
    description: 'IDX powered tool for course selection.',
    category: 'All Subjects',
    url: 'https://cc.indexademics.com/',
    color: '#061971'
  }
];

// Featured on the Study Hub home view: the latest tools from IDX & PA Tech
export const ecosystemTools: EcosystemTool[] = [
  {
    name: 'Synonance',
    maker: 'by IDX',
    tagline: 'AI Review Chatbot',
    description: 'The latest version of the AI-based review chatbot — an IDX tool for smarter studying. Academy is its next-generation successor, currently in development.',
    url: 'https://syno.standardcas.org/',
    icon: '💬',
    accent: '#8b5cf6',
    links: [
      { label: 'New Version (In Dev)', url: 'https://academy.standardcas.org', primary: true },
      { label: 'Old Version', url: 'https://syno.standardcas.org/' }
    ]
  },
  {
    name: 'Launchpad',
    maker: 'by PA Tech',
    makerLogo: '/patech-icon.png',
    tagline: 'Central Sign-In & Hosting',
    description: 'Website hosting and the central sign-in platform for all PA Tech and relevant sites.',
    url: 'https://launchpad.standardcas.org/overview',
    icon: '🚀',
    accent: '#3b82f6'
  },
  {
    name: 'SHSID Study',
    maker: 'by PA Tech',
    makerLogo: '/patech-icon.png',
    tagline: 'Competitions & Hackathons',
    description: 'A PA Tech platform hosting campus competitions, including the Hackathon hosted by the Data Science Club — created by Brian Bowen Deng and his team.',
    url: 'https://study.standardcas.org/login',
    icon: '🏆',
    accent: '#f59e0b'
  },
  {
    name: 'PA Tech',
    maker: 'by PA Tech',
    makerLogo: '/patech-icon.png',
    tagline: 'Homesite',
    description: 'Claim tasks and complete them for service learning — help the PA team build the latest tech.',
    url: 'https://patech.standardcas.org/access',
    icon: '🛠️',
    accent: '#10b981'
  },
  {
    name: 'Academy',
    maker: 'by PA Tech',
    makerLogo: '/patech-icon.png',
    tagline: 'In Development',
    description: 'The updated version of Synonance — a PA Tech platform with guides for different courses, summarized notes, mock tests, study plans, and more. Currently in the development phase.',
    url: 'https://academy.standardcas.org',
    icon: '🎓',
    accent: '#ec4899'
  },
  {
    name: 'SharedSpace',
    maker: 'by PA Tech',
    makerLogo: '/patech-icon.png',
    tagline: 'Student Talent Directory',
    description: 'A student talent directory connecting SHSID builders, designers, writers, and the clubs that need them — the newest piece of AI Central, built and run by students in the PA Tech Department.',
    url: 'https://ss.standardcas.org/',
    icon: '🤝',
    accent: '#06b6d4'
  }
];
