export interface Guide {
  grade: number;
  subject: string;
  level: 'S' | 'S+' | 'H' | 'AP' | 'IB'; // Strict levels
  name: string;
  url: string; // The link to the file in /public/guides/
}