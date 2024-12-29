import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PDFDocument, StandardFonts } from 'pdf-lib';

//TODO: This does not work and needs to be fixed
export const pdfExporterTool = tool(
    async (input) => {
        try {
            const { textContent } = input;

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const page = pdfDoc.addPage([600, 800]);

            const { width, height } = page.getSize();
            const fontSize = 12;

            // Add text to the PDF
            page.drawText(textContent, {
                x: 50,
                y: height - 50, // Start from the top of the page
                size: fontSize,
                font: font,
                lineHeight: 14,
            });

            // Serialize the PDF to bytes
            const pdfBytes = await pdfDoc.save();

            // Return the PDF as a Base64 string
            const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
            return {
                pdfBase64,
                message: 'PDF generated successfully. You can download it.',
            };
        } catch (error) {
            return { error: `Error exporting PDF: ${error.message}` };
        }
    },
    {
        name: 'export_pdf',
        description: 'Exports a text object as a formatted PDF file.',
        schema: z.object({
            textContent: z.string().describe('The text content to include in the PDF.'),
        }),
    }
);
