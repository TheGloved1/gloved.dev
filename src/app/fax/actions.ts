'use server';
import { modelProvider } from '@/app/(chat)/api/chat/route';
import { generateText } from 'ai';
import { ModelID } from './../../lib/ai/models';

// In-memory history store (in production, you'd use a database)
const factHistory: string[] = [];
const MAX_HISTORY_SIZE = 50;

const MODEL: ModelID = 'openai/gpt-oss-120b';
const SIMPLE_MODEL: ModelID = 'openai/gpt-oss-20b';

export async function generateFactAction() {
  const CAR_PROMPT_SUFFIX =
    'The fact MUST be about automobiles, cars, or the automotive industry. ONLY car facts are allowed.';

  // First generate a random prompt about the type of fact to generate
  const promptResult = await generateText({
    model: modelProvider.languageModel(MODEL),
    prompt: `Generate a short, specific prompt for generating an interesting and funny car fact. CAR FACTS ONLY. Keep it under 15 words. Examples: 'Generate a weird car design fact', 'Share a surprising car history fact', 'Reveal a funny car manufacturing fact'`,
    temperature: 1,
    maxOutputTokens: 100,
  });

  let factPrompt = String(promptResult.text).trim();

  const generateCarFact = async (prompt: string) => {
    const result = await generateText({
      model: modelProvider.languageModel(MODEL),
      prompt: `${prompt} Keep it concise (1-2 sentences) and engaging. Make it educational but entertaining and funny. ${CAR_PROMPT_SUFFIX}`,
      temperature: 0.8,
      maxOutputTokens: 200,
    });
    return String(result.text).trim();
  };

  let text = await generateCarFact(factPrompt);

  // Validation loop: ensure fact is about cars and unique
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const validationCheck = await generateText({
      model: modelProvider.languageModel(SIMPLE_MODEL),
      prompt: `You are a strict validator. Determine if this fact is about automobiles, cars, or the automotive industry. If it IS a car fact, respond with "CAR_OK". If it is NOT about cars, respond with "NOT_CAR".\n\nFact: "${text}"\n\nRespond with exactly one word: CAR_OK or NOT_CAR.`,
      temperature: 0.1,
      maxOutputTokens: 10,
    });

    const isCarFact = String(validationCheck.text).trim().includes('CAR_OK');

    if (!isCarFact) {
      const newPromptResult = await generateText({
        model: modelProvider.languageModel(MODEL),
        prompt: `Generate a short, specific prompt for a car fact. MUST be about automobiles. Keep it under 15 words. Examples: 'Weird car design fact', 'Surprising car history fact', 'Funny car manufacturing fact'. ONLY car-related prompts.`,
        temperature: 1,
        maxOutputTokens: 100,
      });
      factPrompt = String(newPromptResult.text).trim();
      text = await generateCarFact(factPrompt);
      retries++;
      continue;
    }

    // Uniqueness check
    const uniquenessCheck = await generateText({
      model: modelProvider.languageModel(SIMPLE_MODEL),
      prompt: `Here is a list of previously generated facts: ${factHistory.slice(-10).join(' | ')}\n\nHere is a new fact: "${text}"\n\nIs this new fact too similar to any in the list? If yes, suggest a modified prompt to generate a more unique car fact. If no, respond with "UNIQUE". Keep your response brief.`,
      temperature: 0.3,
      maxOutputTokens: 100,
    });

    const uniquenessResponse = String(uniquenessCheck.text).trim();

    if (uniquenessResponse.includes('UNIQUE')) {
      break; // Fact is both car-related and unique
    }

    // Regenerate with modified prompt
    const modifiedPromptResult = await generateText({
      model: modelProvider.languageModel(MODEL),
      prompt: `Based on this feedback: "${uniquenessResponse}", generate a new, different prompt for a CAR FACT ONLY. Keep it under 15 words and focus on a completely different car-related topic or angle.`,
      temperature: 1,
      maxOutputTokens: 100,
    });

    factPrompt = String(modifiedPromptResult.text).trim();
    text = await generateCarFact(factPrompt);
    retries++;
  }

  // Add to history
  factHistory.push(text);

  // Maintain history size
  if (factHistory.length > MAX_HISTORY_SIZE) {
    factHistory.shift();
  }

  return text;
}
