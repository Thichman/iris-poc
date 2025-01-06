import { ChatOpenAI } from '@langchain/openai';
import { toolsArray } from './tools/main-tools';

// Define and export the main model
export const mainModel = new ChatOpenAI({
    model: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.ARCTECH_OPENAI_KEY,
}).bindTools(toolsArray);
