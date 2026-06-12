import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface RepoData {
  name: string;
  languages: Record<string, number>;
  topics: string[];
  readmeExcerpt?: string;
  description?: string;
}

/**
 * Detects if a description is a placeholder or incomplete
 */
export function isPlaceholderDescription(description: string | null | undefined): boolean {
  if (!description || description.trim().length === 0) {
    return true;
  }

  const trimmed = description.trim();
  
  // Too short to be meaningful
  if (trimmed.length < 20) {
    return true;
  }

  // Common placeholder patterns (case-insensitive)
  const placeholderPatterns = [
    /^a project$/i,
    /^repository$/i,
    /^my project$/i,
    /^project$/i,
    /^repo$/i,
    /^github repository$/i,
    /^a github repository$/i,
    /^this is a repository$/i,
    /^placeholder$/i,
    /^description$/i,
    /^add description$/i,
    /^no description$/i,
    /^n\/a$/i,
    /^tbd$/i,
    /^todo$/i,
  ];

  return placeholderPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Generates a project description using OpenAI
 * Returns null on failure to allow fallback to existing logic
 */
export async function generateProjectDescription(repo: RepoData): Promise<string | null> {
  if (!openai) {
    console.warn('[OpenAI] OPENAI_API_KEY not set, skipping description generation');
    return null;
  }

  try {
    // Extract language names from the languages object (sorted by bytes, top 5)
    const languageNames = Object.entries(repo.languages || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([lang]) => lang);

    // Build the prompt
    const languagesText = languageNames.length > 0 
      ? languageNames.join(', ')
      : 'No specific languages detected';
    
    const topicsText = (repo.topics || []).length > 0
      ? repo.topics.join(', ')
      : 'No topics';

    const readmeText = repo.readmeExcerpt 
      ? `\nREADME excerpt:\n${repo.readmeExcerpt}`
      : '';

    const prompt = `Project: ${repo.name}
Tech: ${languagesText}${topicsText !== 'No topics' ? `\nTopics: ${topicsText}` : ''}${readmeText}

Write 1-2 sentences (max 120 characters total). What does it do? Why does it exist? Be direct and brief.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You write ultra-brief project descriptions. Max 120 characters. 1-2 sentences only. UK English. Never mention repository, GitHub, source control, containerisation, Docker, or deployment. Just say what it does.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 60,
    });

    const generatedDescription = response.choices[0]?.message?.content?.trim();
    
    if (!generatedDescription) {
      console.warn(`[OpenAI] No description generated for ${repo.name}`);
      return null;
    }

    // Post-process to ensure UK English and no em dashes
    let processed = generatedDescription
      .replace(/\u2014/g, '-') // Replace em dashes with hyphens
      .replace(/\u2013/g, '-') // Replace en dashes with hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Ensure it's 1-3 sentences (rough check)
    const sentences = processed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) {
      // Take first 3 sentences
      processed = sentences.slice(0, 3).join('. ') + '.';
    }

    console.log(`[OpenAI] Generated description for ${repo.name}: ${processed.substring(0, 100)}...`);
    return processed;

  } catch (error: any) {
    // Handle rate limits and API errors gracefully
    if (error?.status === 429) {
      console.warn(`[OpenAI] Rate limit exceeded for ${repo.name}, will retry later`);
    } else if (error?.status === 401 || error?.status === 403) {
      console.error(`[OpenAI] Authentication error: ${error.message}`);
    } else {
      console.error(`[OpenAI] Error generating description for ${repo.name}:`, error?.message || error);
    }
    return null;
  }
}


