import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText, tool } from 'ai';
import z from 'zod';
import { genreMap } from '~/constants';
import { getEvents } from '~/utils/events';
import { llmEvents } from '~/utils/llm_events';

export async function POST(req: Request) {
  const { messages, location, genres } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-haiku-20240307'),
    messages,
    tools: {
      eventfinder: tool({
        description: 'Find events in a location',
        parameters: z.object({
          location_latitude: z.number().describe('The latitude of the location to find events for'),
          location_longitude: z
            .number()
            .describe('The longitude of the location to find events for'),
          genres: z.array(z.string()).describe('The genres to find events for'),
          dateStart: z.string().describe('The start date to find events for'),
          dateEnd: z.string().describe('The end date to find events for'),
        }),
        execute: async ({ location_latitude, location_longitude, genres, dateStart, dateEnd }) => {
          const mappedGenres = await llmEvents(genres);

          if ('error' in mappedGenres) {
            return {
              error: mappedGenres.error,
              details: mappedGenres.details,
            };
          }

          const events = await getEvents({
            classificationName: 'Music',
            startDateTime: dateStart,
            endDateTime: dateEnd,
            latlong: [location.latitude, location.longitude],
            radius: 100,
            unit: 'km',
            genreId: mappedGenres,
          });

          return {
            mappedGenres,
            originalGenres: genres,
            events,
            message: `Successfully mapped ${genres.length} genres to ${mappedGenres.length} Ticketmaster genre IDs and found ${events?._embedded?.events?.length} events`,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
