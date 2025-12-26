export interface Streamer {
  id: string;
  name: string;
  platform: 'twitch';
  game: string;
  description: string;
  viewerCount?: string;
  url: string;
  embedUrl?: string; // For Twitch mostly
  thumbnail?: string; // Fallback image
  tags: string[];
}

export interface VoteRecord {
  streamerId: string;
  vote: 'up' | 'down' | null;
  timestamp: number;
}

export type Category = 'Gaming' | 'Art' | 'Music' | 'Just Chatting' | 'Coding' | 'Retro';

export const CATEGORIES: Category[] = ['Gaming', 'Art', 'Music', 'Just Chatting', 'Coding', 'Retro'];