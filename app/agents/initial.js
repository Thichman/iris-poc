import { ChatOpenAI } from '@langchain/chat_models';
import { initializeAgentExecutorWithOptions } from '@langchain/agents';
import { DynamicTool } from '@langchain/tools';

export async function simpleAgentWithMemory(input, memory) {
    // Define a basic tool for math calculations
    const mathTool = new DynamicTool({
        name: 'math_tool',
        description: 'Performs basic math calculations. Provide the equation as input.',
        func: async (input) => {
            try {
                const result = eval(input); // Simple evaluation for demo purposes
                return `Result: ${result}`;
            } catch (error) {
                return 'Error: Invalid math expression.';
            }
        },
    });

    // Set up the chat model
    const chatModel = new ChatOpenAI({ temperature: 0 });

    // Initialize the agent with memory
    const executor = await initializeAgentExecutorWithOptions(
        [mathTool],
        chatModel,
        {
            agentType: 'zero-shot-react-description',
            memory: memory, // Add memory to the agent
            verbose: true,
        }
    );

    // Use the agent to process the input
    const result = await executor.call({ input });

    return result.output;
}
