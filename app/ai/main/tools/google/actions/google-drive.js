import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { google } from 'googleapis';
import { createGoogleClient } from '@/app/ai/utils/google/google-client';

export const googleDriveFileTool = tool(
    async (input) => {
        const { action, query, fileId } = input;
        const oauth2Client = await createGoogleClient();
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        if (action === 'find') {
            try {
                const res = await drive.files.list({
                    q: query,
                    fields: 'files(id, name, webViewLink)',
                });
                return { message: 'Files found successfully', files: res.data.files };
            } catch (error) {
                console.error('Error finding files:', error.response?.data || error.message);
                return { error: 'Failed to find files: ' + error.message };
            }
        } else if (action === 'open') {
            if (!fileId) throw new Error('fileId is required for open action');
            try {
                const res = await drive.files.get({
                    fileId,
                    fields: 'id, name, webViewLink',
                });
                return { message: 'File details retrieved successfully', file: res.data };
            } catch (error) {
                console.error('Error opening file:', error.response?.data || error.message);
                return { error: 'Failed to open file: ' + error.message };
            }
        } else {
            throw new Error(`Unsupported action: ${action}`);
        }
    },
    {
        name: 'google_drive_file',
        description: `
      Perform operations on Google Drive files.
      
      Supported actions:
      - find: Search for files in the user's Google Drive using a query string (for example, "name contains 'Report'" or filtering by mimeType).
      - open: Retrieve details for a specific file by its fileId (including a link to view the file).
    `,
        schema: z.object({
            action: z.enum(['find', 'open']).describe('The operation to perform on Google Drive files'),
            query: z.string().optional().describe('The search query in Google Drive query syntax (required for "find" action)'),
            fileId: z.string().optional().describe('The file ID (required for "open" action)'),
        }),
    }
);
