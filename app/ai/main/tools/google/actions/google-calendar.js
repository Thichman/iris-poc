import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { createGoogleClient } from '@/app/ai/utils/google/google-client';

export const googleCalendarTool = tool(
    async (input) => {
        const { action, eventId, eventData, timeMin, timeMax } = input;
        console.log("Input to googleCalendarTool:", input);

        // Create an authenticated Google OAuth client
        const oauth2Client = await createGoogleClient();
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        if (action === 'create') {
            console.log('Creating event with data:', eventData);
            try {
                const res = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: eventData,
                });
                console.log("Create response:", res.data);
                return { message: 'Event created successfully', event: res.data };
            } catch (error) {
                console.error("Error creating event:", error.response?.data || error.message);
                throw error;
            }
        } else if (action === 'update') {
            if (!eventId) throw new Error('eventId is required for update');
            try {
                const res = await calendar.events.patch({
                    calendarId: 'primary',
                    eventId,
                    requestBody: eventData,
                });
                console.log("Update response:", res.data);
                return { message: 'Event updated successfully', event: res.data };
            } catch (error) {
                console.error("Error updating event:", error.response?.data || error.message);
                throw error;
            }
        } else if (action === 'delete') {
            if (!eventId) throw new Error('eventId is required for delete');
            try {
                const res = await calendar.events.delete({
                    calendarId: 'primary',
                    eventId,
                });
                console.log("Delete response:", res.data);
                return { message: 'Event deleted successfully' };
            } catch (error) {
                console.error("Error deleting event:", error.response?.data || error.message);
                throw error;
            }
        } else if (action === 'list') {
            try {
                const res = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin,
                    timeMax,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                console.log("List response:", res.data);
                return { message: 'Events retrieved successfully', events: res.data.items };
            } catch (error) {
                console.error("Error listing events:", error.response?.data || error.message);
                throw error;
            }
        } else {
            console.error('Unsupported action:', action);
            throw new Error(`Unsupported action: ${action}`);
        }
    },
    {
        name: 'google_calendar',
        description: `
        Perform operations on Google Calendar events.
        
        Supported actions:
        - create: Create a new event. Provide an eventData object with details (e.g., summary, start, end, description).
        - update: Update an existing event. Provide an eventId and an eventData object with fields to update.
        - delete: Delete an event. Provide the eventId.
        - list: Retrieve events within a specified time range. Provide timeMin and timeMax as ISO strings.
    `,
        schema: z.object({
            action: z.enum(['create', 'update', 'delete', 'list']).describe('The calendar operation to perform'),
            eventId: z.string().optional().describe('The event ID (required for update and delete actions)'),
            eventData: z
                .object({
                    summary: z.string().optional().describe('The event summary/title'),
                    description: z.string().optional().describe('The event description'),
                    location: z.string().optional().describe('The event location'),
                    start: z
                        .object({
                            dateTime: z.string().optional().describe('Start date/time in ISO format'),
                            timeZone: z.string().optional().describe('Time zone for the start time'),
                        })
                        .optional(),
                    end: z
                        .object({
                            dateTime: z.string().optional().describe('End date/time in ISO format'),
                            timeZone: z.string().optional().describe('Time zone for the end time'),
                        })
                        .optional(),
                })
                .optional()
                .describe('The event data for creating or updating an event'),
            timeMin: z.string().optional().describe('The start of the time range (ISO format) for listing events'),
            timeMax: z.string().optional().describe('The end of the time range (ISO format) for listing events'),
        }),
    }
);
