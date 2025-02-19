import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createSalesforceClient } from "@/app/ai/utils/salesforce/get-axios-instance";

export const salesforceCreateReportTool = tool(
    async (input) => {
        const { reportName, objectName, fields, filters = [] } = input;

        if (!reportName || !objectName || !fields || fields.length === 0) {
            return { error: "Missing required fields: 'reportName', 'objectName', or 'fields'." };
        }

        try {
            const client = await createSalesforceClient();

            console.log(`Creating report: "${reportName}" on "${objectName}" with fields: ${fields.join(", ")}`);

            // Retrieve valid report types from Salesforce
            const reportTypesResponse = await client.get("/services/data/v57.0/analytics/reportTypes");
            const validReportType = reportTypesResponse.data.reportTypeInfos.find((r) =>
                r.label.includes(objectName) || r.name.includes(objectName)
            );

            if (!validReportType) {
                throw new Error(`No valid report type found for '${objectName}'. Check Salesforce report types.`);
            }

            // Salesforce report metadata
            const reportMetadata = {
                name: reportName,
                reportType: validReportType.name, // Ensure we use a valid report type
                detailColumns: fields, // Corrected key
                reportFilters: filters.map(({ field, operator, value }) => ({
                    column: field,
                    operator,
                    value,
                })),
            };

            // Create the report
            const response = await client.post("/services/data/v57.0/analytics/reports", reportMetadata);

            if (!response.data || !response.data.id) {
                throw new Error("Failed to create report in Salesforce.");
            }

            // Construct report URL
            const instanceUrl = client.defaults.baseURL.replace("/services/data/v57.0", "");
            const reportLink = `${instanceUrl}/lightning/r/Report/${response.data.id}/view`;

            return {
                message: `Report "${reportName}" created successfully.`,
                reportId: response.data.id,
                reportLink,
            };
        } catch (error) {
            console.error("Error creating Salesforce report:", error.message);
            return { error: `Failed to create report: ${error.message}` };
        }
    },
    {
        name: "salesforce_create_report",
        description: `
        Creates a new report in Salesforce based on user-defined parameters.

        **Example Usage:**
        - "Create a report called 'Q1 Sales' for the 'Opportunity' object, including fields 'Name', 'Amount', and 'Stage'."
        - "Generate a report for 'Leads' showing 'Company Name', 'Status', and 'Owner' with a filter for 'Status = Open'."

        **Input Fields:**
        - 'reportName': (string) The name of the report to create.
        - 'objectName': (string) The Salesforce object to base the report on (e.g., 'Opportunity', 'Lead').
        - 'fields': (array of strings) The fields to include in the report.
        - 'filters': (optional, array of objects) Conditions to filter the data (e.g., [{ field: "StageName", operator: "=", value: "Closed Won" }]).

        **Output:**
        - Returns a success message, the report ID, and a direct link to view the report in Salesforce.
    `,
        schema: z.object({
            reportName: z.string().describe("The name of the report to create."),
            objectName: z.string().describe("The Salesforce object for the report (e.g., 'Opportunity')."),
            fields: z.array(z.string()).describe("The fields to include in the report."),
            filters: z
                .array(
                    z.object({
                        field: z.string().describe("The field to filter by."),
                        operator: z.string().describe("The comparison operator (e.g., '=', '>', '<', 'LIKE')."),
                        value: z.string().describe("The value to compare against."),
                    })
                )
                .optional()
                .default([]) // Ensure filters default to an empty array if not provided
                .describe("Filters to apply to the report."),
        }),
    }
);
