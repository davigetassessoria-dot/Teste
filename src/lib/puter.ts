
import { puter } from '@heyputer/puter.js';

const SYSTEM_PROMPT = `You are AppForge, an expert AI web developer.
Generate high-quality React + Tailwind CSS code using TypeScript.
Always return your response as a valid JSON object representing a file system.
Format:
{
  "explanation": "Brief explanation of what was built",
  "files": {
    "App.tsx": "content",
    "components/Header.tsx": "content",
    "index.css": "content"
  }
}
Do not include markdown outside the JSON. Use Grok Build 0.1 logic.
The generated app should be a single-page React application that can be rendered in an iframe.
For the preview, assume React and ReactDOM are available via global CDN or standard ESM imports.`;

export async function generateApp(prompt: string, history: any[]) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: prompt }
  ];

  try {
    // Puter.js uses a user-pays model, so this works without an API key in the code.
    const response = await puter.ai.chat(messages, {
      model: 'x-ai/grok-build-0.1',
      stream: true,
    });
    return response;
  } catch (error) {
    console.error("Puter AI Error:", error);
    throw error;
  }
}
