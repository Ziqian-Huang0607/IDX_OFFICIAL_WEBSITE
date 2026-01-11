// src/data/links.ts
export interface ExternalResource {
  name: string;
  description: string;
  category: string;
  url: string;
  color: string; // Used for a glowing effect
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
  }
];