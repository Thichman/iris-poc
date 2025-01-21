export default function Home() {
  return (
    <div className="p-6">
      <section className="hero bg-gradient-to-br from-blue-500 to-purple-600 text-white text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Revolutionize Your Workflow with AI Automation
          </h1>
          <p className="text-lg mb-6">
            Let Iris handle the tedious tasks, so you can focus on what truly matters.
          </p>
          <a
            href="/sign-up"
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded shadow-lg hover:bg-gray-100"
          >
            Get Started Now
          </a>
        </div>
      </section>

      <section className="features py-16 bg-gray-100 text-black text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Why Choose Iris?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-item p-4 bg-white shadow-md rounded">
              <img src="/voice-command-icon.png" alt="Voice Commands" className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Voice Commands</h3>
              <p>Update your CRM effortlessly using natural language voice inputs.</p>
            </div>
            <div className="feature-item p-4 bg-white shadow-md rounded">
              <img src="/salesforce-integration-icon.png" alt="Salesforce Integration" className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Seamless Integration</h3>
              <p>Connect Iris directly with Salesforce for real-time updates.</p>
            </div>
            <div className="feature-item p-4 bg-white shadow-md rounded">
              <img src="/time-saving-icon.png" alt="Time Saving" className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Save Time</h3>
              <p>Reduce manual data entry and increase productivity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mission py-16 bg-white text-black text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg mb-6">
            At ArcTech Automations, we’re dedicated to transforming the workforce by eliminating tedious tasks and bringing true automation to businesses of all sizes. Our AI-driven tools empower professionals to work smarter, not harder.
          </p>
          <img src="/automation-mission.jpg" alt="Automation Mission" className="w-full h-auto rounded shadow-lg" />
        </div>
      </section>

      {/* <section className="testimonials py-16 bg-gray-100 text-black text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">What Professionals Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="testimonial-item p-6 bg-white shadow-md rounded">
              <p className="mb-4">
                "Iris has completely changed how I manage my sales pipeline. It's like having an assistant that never sleeps!"
              </p>
              <h4 className="font-bold">- Jane Doe, Sales Manager</h4>
            </div>
            <div className="testimonial-item p-6 bg-white shadow-md rounded">
              <p className="mb-4">
                "The automation features save me hours every week. Highly recommend Iris to any professional."
              </p>
              <h4 className="font-bold">- John Smith, Account Executive</h4>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
