import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { genreMap } from '~/constants';

export const llmEvents = async (
  genres: string[]
): Promise<string[] | { error: string; details: string }> => {
  try {
    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      messages: [
        {
          role: 'user',
          content: `You must return ONLY a valid JSON array of Ticketmaster genre IDs (tm_id) that match the input genres. Do not include any explanation or additional text.

Genre mapping data: ${JSON.stringify(genreMap)}

Input genres: ${genres.join(', ')}

Return format: ["tm_id1", "tm_id2"]
If no matches found, return: []

Response:`,
        },
      ],
    });

    let mappedGenres: string[] = [];

    try {
      // Try to find JSON array in the response
      const jsonMatch = text.match(/\[.*\]/);
      if (jsonMatch) {
        mappedGenres = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(mappedGenres)) {
          throw new Error('Invalid JSON response');
        }
      } else {
        // If no JSON array found, try parsing the entire response
        mappedGenres = JSON.parse(text);
        if (!Array.isArray(mappedGenres)) {
          throw new Error('Invalid JSON response');
        }
      }

      return mappedGenres;
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      return { error: 'Failed to parse LLM response as JSON', details: 'Unknown error' };
    }
  } catch (error) {
    console.error('Error in llmEvents:', error);
    return { error: 'Failed to find events', details: 'Unknown error' };
  }
};
