'use server';

import { modelProvider } from '@/app/(chat)/api/chat/route';
import { generateText } from 'ai';

// In-memory history store (in production, you'd use a database)
const factHistory: string[] = [];
const MAX_HISTORY_SIZE = 50;

export async function generateFactAction() {
  // First generate a random prompt about the type of fact to generate
  const promptResult = await generateText({
    model: modelProvider.languageModel('moonshotai/kimi-k2-instruct-0905'),
    prompt:
      "Generate a short, specific prompt for generating an interesting and funny fact. CAR FACTS ONLY. Keep it under 15 words. Examples: 'Generate a weird car design fact', 'Share a surprising car history fact', 'Reveal a funny car manufacturing fact'",
    temperature: 1,
    maxOutputTokens: 100,
  });

  let factPrompt = String(promptResult.text).trim();

  // Generate the actual fact
  const result = await generateText({
    model: modelProvider.languageModel('moonshotai/kimi-k2-instruct-0905'),
    prompt: `${factPrompt}. Keep it concise (1-2 sentences) and engaging. Make it educational but entertaining and funny.`,
    temperature: 0.8,
    maxOutputTokens: 100,
  });

  let text = String(result.text).trim();

  // Third AI check: Ensure uniqueness and modify prompt if needed
  const uniquenessCheck = await generateText({
    model: modelProvider.languageModel('moonshotai/kimi-k2-instruct-0905'),
    prompt: `Here is a list of previously generated facts: ${factHistory.slice(-10).join(' | ')}\n\nHere is a new fact: "${text}"\n\nIs this new fact too similar to any in the list? If yes, suggest a modified prompt to generate a more unique fact. If no, respond with "UNIQUE". Keep your response brief.`,
    temperature: 0.3,
    maxOutputTokens: 100,
  });

  const uniquenessResponse = String(uniquenessCheck.text).trim();

  // If the fact is not unique, regenerate with modified prompt
  if (!uniquenessResponse.includes('UNIQUE')) {
    const modifiedPromptResult = await generateText({
      model: modelProvider.languageModel('moonshotai/kimi-k2-instruct-0905'),
      prompt: `Based on this feedback: "${uniquenessResponse}", generate a new, different prompt for a fact. Keep it under 15 words and focus on a completely different topic or angle.`,
      temperature: 1,
      maxOutputTokens: 100,
    });

    factPrompt = String(modifiedPromptResult.text).trim();

    // Regenerate the fact with the modified prompt
    const newResult = await generateText({
      model: modelProvider.languageModel('moonshotai/kimi-k2-instruct-0905'),
      prompt: `${factPrompt}. Keep it concise (1-2 sentences) and engaging. Make it educational but entertaining and funny.`,
      temperature: 0.8,
      maxOutputTokens: 100,
    });

    text = String(newResult.text).trim();
  }

  // Add to history
  factHistory.push(text);

  // Maintain history size
  if (factHistory.length > MAX_HISTORY_SIZE) {
    factHistory.shift();
  }

  return text;
}
