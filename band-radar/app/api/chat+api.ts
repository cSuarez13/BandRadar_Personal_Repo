import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import z from 'zod';
import { getEvents } from '~/utils/events';
import { llmEvents } from '~/utils/llm_events';
import { fetchPlaceDetails } from '~/utils/place_details';
import { getPlace } from '~/utils/places';

export async function POST(req: Request) {
  const { messages, location, genres, currentDate } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-haiku-20240307'),
    messages,
    tools: {
      eventfinder: tool({
        description: `Find events in a location never ever set the dateStart or dateEnd to a date before the current date (${currentDate})`,
        parameters: z.object({
          location: z.string().describe('The location to find events for'),
          genres: z.array(z.string()).describe('The genres to find events for'),
          dateStart: z
            .string()
            .describe(
              'The start date to find events for, the current date is ' + currentDate + 'Z'
            ),
          dateEnd: z
            .string()
            .describe('The end date to find events for, the current date is ' + currentDate + 'Z'),
        }),
        execute: async ({ location, genres, dateStart, dateEnd }) => {
          const mappedGenres = await llmEvents(genres);

          if ('error' in mappedGenres) {
            return {
              error: mappedGenres.error,
              details: mappedGenres.details,
            };
          }

          // Call google Places API to get the latitude and longitude of the location to get place_id
          const place = await getPlace(location);

          if (!place.candidates?.[0]?.place_id) {
            return {
              error: 'No place found',
              details: 'We could not find the location you are looking for, please try again.',
            };
          }

          // Call Google Maps API to get the latitude and longitude of the location
          const placeDetails = await fetchPlaceDetails(place.candidates?.[0]?.place_id, location);

          if (!placeDetails) {
            return {
              error: 'No place details found',
              details: 'We could not find the location you are looking for, please try again.',
            };
          }

          const events = await getEvents({
            classificationName: 'Music',
            startDateTime:
              new Date(new Date(dateStart).setHours(0, 0, 0, 0)).toISOString().split('.')[0] + 'Z',
            endDateTime:
              new Date(new Date(dateEnd).setHours(23, 59, 59, 999)).toISOString().split('.')[0] +
              'Z',
            latlong: [placeDetails.lat, placeDetails.lng],
            radius: 100,
            unit: 'km',
            genreId: mappedGenres,
          });

          return {
            mappedGenres,
            originalGenres: genres,
            place,
            placeDetails,
            events: events?._embedded,
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
