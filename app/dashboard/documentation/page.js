export default function GuidePage() {
    return (
        <div className="min-h-screen bg-gray-100 text-black p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">How to Use IRIS Effectively</h1>

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Section 1 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Start with Clear Requests</h2>
                    <p className="text-gray-700">
                        When interacting with IRIS, it&apos;s important to be specific and concise. IRIS is designed to process detailed requests efficiently. Start your conversation with a clear intent, such as:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>Instead of saying, <em>“Show me something about contacts,”</em> try: <strong>“Find all contacts created last month.”</strong></li>
                        <li>Avoid vague phrasing like, <em>“Get data for me.”</em> Instead, use: <strong>“Show me opportunities that closed this quarter.”</strong></li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Guide IRIS Through Multi-Step Conversations</h2>
                    <p className="text-gray-700">
                        IRIS supports multi-step conversations. If your task involves multiple steps, break it down into manageable parts. For example:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>Step 1: Ask for an overview, e.g., <strong>“List all accounts created this year.”</strong></li>
                        <li>Step 2: Follow up with filters, e.g., <strong>“Filter for accounts with opportunities over $10,000.”</strong></li>
                        <li>Step 3: Request actions, e.g., <strong>“Update the priority of these accounts to High.”</strong></li>
                    </ul>
                    <p className="mt-3 text-gray-700">
                        This step-by-step approach ensures IRIS understands your intent and delivers accurate results.
                    </p>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Be Specific with Fields and Actions</h2>
                    <p className="text-gray-700">
                        Specify the fields or data you’re interested in. This helps IRIS quickly narrow down the results. For example:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>Instead of saying, <em>“Get me the data for contacts,”</em> try: <strong>“Show me the first name, last name, and email for all contacts.”</strong></li>
                        <li>When requesting updates, include the object and field names explicitly, e.g., <strong>“Update the contact with ID 003XXXXXXXXX to change the phone number to 123-456-7890.”</strong></li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Stay Contextual and Sequential</h2>
                    <p className="text-gray-700">
                        IRIS remembers the context of your conversation. You can refer to previous steps in your requests. For instance:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>
                            If you asked, <strong>“Show me all leads from last week,”</strong> you can follow up with: <strong>“Filter only those assigned to John Doe.”</strong>
                        </li>
                        <li>
                            After retrieving a list of opportunities, you can ask: <strong>“Send this list to my email as a report.”</strong>
                        </li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Use Natural Language</h2>
                    <p className="text-gray-700">
                        IRIS is designed to understand natural language. Feel free to ask questions or make requests in a conversational tone. For example:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>
                            <strong>“Can you pull a report of all accounts with overdue payments?”</strong>
                        </li>
                        <li>
                            <strong>“Create a new lead for Jane Doe with email jane.doe@example.com.”</strong>
                        </li>
                    </ul>
                </section>

                {/* Section 6 */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Ask for Help</h2>
                    <p className="text-gray-700">
                        If you&apos;re unsure about how to phrase a request, ask IRIS directly! For example:
                    </p>
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                        <li>
                            <strong>“How can I get a list of all accounts?”</strong>
                        </li>
                        <li>
                            <strong>“What fields are available in the Opportunities object?”</strong>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
