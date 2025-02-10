import { ChatOpenAI } from '@langchain/openai';
import { salesforceToolsArray } from './tools/main-tools';

export const salesforceAgentModel = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
    systemMessage: `
    You are the Salesforce agent, specialized in managing all Salesforce-related operations, including querying, updating, creating, deleting, and describing Salesforce data.
    Additionally, you have access to the full suite of tools originally available to the main agent to handle any supplementary tasks.
    Your goal is to execute operations accurately and efficiently: always verify that all required inputs are present, explain your chosen actions and tools clearly, and provide detailed, actionable responses.
    If an operation requires clarification or additional details, ask the user before proceeding, and ensure that any destructive actions (e.g., deletions or updates) are confirmed.
  `,
}).bindTools(salesforceToolsArray);
