import { ChatOpenAI } from '@langchain/openai';
import { fetchSalesforceMetadataTool, querySalesforceDataTool } from '../main/tools/salesforce/test-tools';
// Define and export the Salesforce agent model
export const salesforceAgentModel = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
}).bindTools(fetchSalesforceMetadataTool, querySalesforceDataTool);
