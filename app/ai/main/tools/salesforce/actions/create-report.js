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

            // STEP 1: Retrieve object metadata via the describe endpoint
            const describeResponse = await client.get(`/services/data/v57.0/sobjects/${objectName}/describe`);
            const metadata = describeResponse.data;
            if (!metadata || !metadata.fields) {
                throw new Error(`Failed to retrieve metadata for object "${objectName}"`);
            }
            // Log the metadata for debugging
            console.log(`Metadata for "${objectName}":`, metadata.fields.map(f => f.name));

            // Validate that each requested field exists
            const validFieldNames = metadata.fields.map(field => field.name);
            const invalidFields = fields.filter(field => !validFieldNames.includes(field));
            if (invalidFields.length > 0) {
                throw new Error(`The following fields are not valid for ${objectName}: ${invalidFields.join(", ")}`);
            }

            // STEP 2: Retrieve valid report types from Salesforce
            const reportTypesResponse = await client.get("/services/data/v57.0/analytics/reportTypes");
            console.log("Report Types Response:", reportTypesResponse.data);

            // Flatten the grouped report types into a single array
            let allReportTypes = [];
            for (const group of reportTypesResponse.data) {
                if (group.reportTypes && Array.isArray(group.reportTypes)) {
                    allReportTypes.push(...group.reportTypes);
                }
            }

            // Find a matching report type based on the object name
            let validReportType = allReportTypes.find((r) =>
                r.label.toLowerCase().includes(objectName.toLowerCase()) ||
                (r.name && r.name.toLowerCase().includes(objectName.toLowerCase()))
            );

            if (!validReportType) {
                // Fall back to default mapping if none found
                const defaultReportTypes = {
                    Lead: "Leads",
                    Opportunity: "Opportunities",
                    Account: "Accounts",
                };
                if (defaultReportTypes[objectName]) {
                    validReportType = { name: defaultReportTypes[objectName] };
                    console.warn(`Falling back to default report type for "${objectName}": ${validReportType.name}`);
                } else {
                    throw new Error(`No valid report type found for '${objectName}'. Check Salesforce report types.`);
                }
            }

            // STEP 3: Construct the payload for report creation
            const payload = {
                reportMetadata: {
                    name: reportName,
                    reportType: validReportType.name, // Must be included!
                    reportFormat: "TABULAR",
                    detailColumns: fields,
                    reportFilters: filters.map(({ field, operator, value }) => ({
                        column: field,
                        // Convert operator if necessary (e.g., ">=" to "greaterOrEqual")
                        operator: operator === ">=" ? "greaterOrEqual" : operator,
                        value,
                    })),
                },
            };

            console.log("Payload for creating report:", JSON.stringify(payload, null, 2));

            // STEP 4: Create the report
            const createResponse = await client.post("/services/data/v57.0/analytics/reports", payload);

            if (!createResponse.data || !createResponse.data.id) {
                throw new Error("Failed to create report in Salesforce.");
            }

            // Construct report URL for viewing in Salesforce Lightning
            const instanceUrl = client.defaults.baseURL.replace("/services/data/v57.0", "");
            const reportLink = `${instanceUrl}/lightning/r/Report/${createResponse.data.id}/view`;

            return {
                message: `Report "${reportName}" created successfully.`,
                reportId: createResponse.data.id,
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
        - Report Name: "Leads Created in Last 30 Days"
        - Object Name: "Lead"
        - Fields: ["Id", "Name", "Company", "Email", "Phone", "CreatedDate"]
        - Filters: [{"field": "CreatedDate", "operator": ">=", "value": "LAST_N_DAYS:30"}]

        **Output:**
        - Returns a success message, the report ID, and a direct link to view the report in Salesforce.
    `,
        schema: z.object({
            reportName: z.string().describe("The name of the report to create."),
            objectName: z.string().describe("The Salesforce object for the report (e.g., 'Opportunity', 'Lead')."),
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
                .default([])
                .describe("Filters to apply to the report."),
        }),
    }
);
