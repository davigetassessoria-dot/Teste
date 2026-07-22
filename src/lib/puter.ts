import { puter } from '@heyputer/puter.js';

const SYSTEM_PROMPT = `You are AppForge, an expert AI web developer.
Generate high-quality React + Tailwind CSS code using JavaScript (no TypeScript).
Always return your response as a valid JSON object representing a file system.
Format:
{
  "explanation": "Brief explanation of what was built",
  "files": {
    "App.tsx": "content",
    "index.css": "content"
  }
}
Do not include markdown outside the JSON.
The generated app should be a single-page React application that can be rendered in an iframe.
Use only React and Tailwind. Make the UI modern and polished.
For the preview, assume React and ReactDOM are available via CDN.`;

export async function generateApp(prompt: string, history: any[] = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: prompt },
  ];

  try {
    const response = await (puter.ai.chat as any)(messages, {
      model: 'x-ai/grok-build-0.1',
      stream: true,
      temperature: 0.3,
    });

    return response;
  } catch (error) {
    console.error('Puter AI Error:', error);
    throw error;
  }
}
