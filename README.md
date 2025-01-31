# **IRIS POC Application**

## **Overview**
The IRIS Proof of Concept (POC) application is a modular, AI-driven system designed to integrate seamlessly with Salesforce and other tools to automate business workflows. It uses LangChain's `StateGraph` framework for multi-agent coordination and Supabase for authentication and database management.

## **Features**
- **AI-Powered Assistant:** Leverages OpenAI models to handle user queries and perform tasks.
- **Salesforce Integration:** Secure OAuth-based authentication with tools to query Salesforce objects and execute operations dynamically.
- **Supabase Integration:** User authentication and database management for secure token storage.
- **Extendable Architecture:** Modular setup for tools and agents, allowing seamless addition of new functionalities.
- **REST API Interaction:** Provides endpoints for Salesforce and other integrations.

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone https://github.com/your-repo/iris-poc.git
cd iris-poc
```

### **2. Environment Variables**
1. Copy the example environment file:
   ```bash
   cp .example.env .env.local
   ```
2. Populate `.env.local` with the required keys. Reach out to Tyson for API keys for:
   - OpenAI
   - Salesforce (Client ID, Client Secret, Redirect URI)
   - Supabase Project URL and Service Role Key

### **3. Install Dependencies**
```bash
npm install
```

### **4. Start the Development Server**
```bash
npm run dev
```

---

## **Development Commands**
- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm start`: Start the application in production mode.

---

## **Project Structure**
### **1. Frontend**
- **Pages:** Located in the `app/` directory, built with Next.js.
  - `app/home`: Home/Landing Page.
  - `app/dashboard`: Main AI assistant interface.
  - `app/auth`: Sign-in, sign-up, and password reset pages.
- **Components:** Reusable UI elements, e.g., `AuthButton`, located in `components/`.

### **2. AI Agents**
- **Main Agent:**
  - **File:** `app/ai/main/main-agent.js`
  - Handles general queries and delegates Salesforce-specific tasks.
  - Includes tools like `calculator`, `weather`, and `pdf exporter`.

- **Salesforce Agent:**
  - **File:** `app/ai/salesforce/salesforce-agent.js`
  - Specialized for Salesforce operations, e.g., querying objects and data.

- **StateGraph:**
  - Centralized workflows for AI logic coordination.
  - **Main Workflow:** `app/ai/main/main-workflow.js`
  - **Salesforce Workflow:** `app/ai/salesforce/salesforce-workflow.js`

### **3. Tools**
Reusable tools for specific tasks, located in:
- `app/ai/tools/`: General tools (e.g., `calculator-tool`, `pdf-exporter-tool`).
- `app/ai/salesforce/tools/`: Salesforce-specific tools (e.g., `salesforce_object_lookup`, `soql_query_tool`).

### **4. API Routes**
Backend API routes for authentication and data interaction:
- **Salesforce OAuth:**
  - `api/salesforce/authorize`: Redirects user to Salesforce OAuth.
  - `api/salesforce/callback`: Handles Salesforce OAuth callback and saves tokens.
- **Database Operations:**
  - `api/database/salesforce/set-salesforce-keys`: Saves Salesforce keys to Supabase.

### **5. Utilities**
- **Salesforce Client:**
  - **File:** `app/ai/utils/salesforce/get-axios-instance.js`
  - Provides an Axios instance for authenticated Salesforce API calls.

---

## **Key Features and Flow**

### **1. User Authentication**
- Uses Supabase for sign-up, sign-in, and password reset.
- Stores Salesforce OAuth tokens in a dedicated `salesforce_credentials` table.

### **2. AI Chat**
- The AI chat interface on the dashboard allows users to interact with IRIS.
- Queries are processed using `mainWorkflow`, which can delegate tasks to Salesforce tools.

### **3. Salesforce Operations**
- OAuth-based authentication for secure access to user-specific Salesforce accounts.
- Tools for querying Salesforce objects dynamically via REST API.

### **4. Modular Architecture**
- New tools and agents can be easily added and integrated with the LangChain `StateGraph`.

---

## **Documentation Links**
- [LangChain Multi-Agent Framework](https://langchain-ai.github.io/langgraphjs/concepts/multi_agent/)
- [Salesforce REST API Reference](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [Supabase Documentation](https://supabase.com/docs/)

---

## **Troubleshooting**
1. **Salesforce OAuth Issues:**
   - Ensure correct redirect URI is set in Salesforce Connected App.
   
2. **AI Model Errors:**
   - Check LangChain `StateGraph` setup in workflows.

3. **Database Errors:**
   - Verify Supabase setup and ensure the `salesforce_credentials` table exists.

---

## **Future Enhancements**
- Add more Salesforce-specific tools (e.g., bulk data operations).
- Extend AI capabilities for other integrations beyond Salesforce.
- Improve dashboard UI/UX for streamlined workflows.
- Import a testing library like jest or vitest.
