import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Streamer } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const streamerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    streamers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Display Name of the streamer" },
          username: { type: Type.STRING, description: "Exact username/handle used in the URL (no spaces)" },
          platform: { type: Type.STRING, description: "Must be 'twitch'" },
          game: { type: Type.STRING, description: "The game or category they are likely playing" },
          description: { type: Type.STRING, description: "A brief, catchy description of their style or stream" },
          url: { type: Type.STRING, description: "Full URL to their channel" },
          viewerCount: { type: Type.STRING, description: "The specific viewer count found in search snippet (e.g. '32' or '45'). Do not guess." },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 relevant tags" }
        },
        required: ["name", "username", "platform", "game", "description", "url", "tags"]
      }
    }
  },
  required: ["streamers"]
};

export const fetchUnderratedStreamers = async (category: string): Promise<Streamer[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prompt updated to strictly request LIVE streamers on Twitch only with verifiable viewer counts
  const prompt = `
    Find 4 Twitch channels for '${category}' that are **LIVE RIGHT NOW**.
    
    STRICT FILTERING RULES:
    1. **MUST BE LIVE**: Look for search snippets containing "Live", "watching now", or red dots. 
       - EXCLUDE channels where the snippet says "Offline", "Last live", or dates from the past.
    2. **VIEWER COUNT**: 10 to 80 viewers (Target ~30).
       - EXCLUDE big streamers (1000+ viewers).
       - EXCLUDE empty streams (0-1 viewers).
    3. **PLATFORM**: Twitch ONLY.
    
    SEARCH QUERIES TO SIMULATE:
    - site:twitch.tv "${category}" "watching now"
    - "twitch ${category} live" "viewers" -video
    
    For each streamer, extract the exact viewer count you see in the snippet. If you see "32 watching now", put "32". If you cannot find a number, estimate based on "small community" context but mark it as "~20".
    
    Return JSON with 4 streamers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: streamerSchema,
        systemInstruction: "You are a live stream verifier. You ONLY return streams that are broadcasting at this exact moment. If a stream looks offline, discard it. Prioritize accuracy of 'Live' status over everything else."
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    
    // Transform to our internal type and add embed URLs
    return data.streamers.map((s: any) => {
      // Use the explicit username from schema, fallback to sanitized name. Lowercase is safer for Twitch.
      const handle = (s.username || s.name).replace(/\s+/g, '').toLowerCase();

      // Construct embed URL for Twitch
      const parents = new Set<string>();
      
      // 1. Add current hostname (e.g., 'my-app.bolt.new')
      const hostname = window.location.hostname;
      if (hostname) {
        parents.add(hostname);
        
        // 2. Add root domain logic for subdomains (e.g., 'bolt.new' from 'my-app.bolt.new')
        // This is critical because some environments run inside iframes, and Twitch needs the ANCESTOR domain.
        const parts = hostname.split('.');
        if (parts.length > 2 && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
            // Basic TLD extraction - take last two parts
            const rootDomain = parts.slice(-2).join('.');
            parents.add(rootDomain);
        }
      }
      
      // 3. Add known development and cloud IDE domains to ensure previews work
      parents.add('localhost');
      parents.add('127.0.0.1');
      parents.add('bolt.new');
      parents.add('stackblitz.com');
      parents.add('stackblitz.io');
      parents.add('webcontainer.io');
      parents.add('codesandbox.io');
      parents.add('replit.com');
      parents.add('netlify.app');
      parents.add('vercel.app');

      const parentParams = Array.from(parents)
        .map(p => `parent=${p}`)
        .join('&');

      // Muted=true is crucial for autoplay policies.
      const embedUrl = `https://player.twitch.tv/?channel=${handle}&${parentParams}&muted=true`;
      
      // Clean up viewer count display
      let displayViewers = s.viewerCount || "20-50";
      if (!displayViewers.toLowerCase().includes('viewers')) {
          displayViewers = `${displayViewers} viewers`;
      }

      return {
        id: generateId(),
        name: s.name,
        platform: 'twitch',
        game: s.game,
        description: s.description,
        viewerCount: displayViewers,
        url: s.url,
        embedUrl,
        tags: s.tags || [],
        thumbnail: `https://picsum.photos/seed/${handle}/400/225` // Fallback/Placeholder
      };
    });

  } catch (error) {
    console.error("Failed to fetch streamers:", error);
    // Return empty array to let UI handle empty state
    return [];
  }
};