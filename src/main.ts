// src/types.ts
export interface Guide {
  year: string;
  subject: string;
  level: string;
  name: string;
  url: string;
  grade?: number; // Added the '?' to make it optional
}

export interface ExternalLink {
  name: string;
  url: string;
  category: string;
  description: string;
  color: string;
}