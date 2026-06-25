import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full bg-background pb-20">
      <div className="bg-surface border-b border-border py-16 text-center px-4">
        <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Last updated: October 2023
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-p:text-text-secondary prose-h2:text-foreground max-w-none">
          <p className="lead text-lg mb-8">
            Your privacy is important to us. It is Local Shop's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">1. Information we collect</h2>
          <p className="mb-6">
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-text-secondary">
            <li>Name and contact data</li>
            <li>Payment information (processed securely via our partners)</li>
            <li>Device and usage data</li>
            <li>Location data (for hyper-local deliveries)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. Use of your information</h2>
          <p className="mb-6">
            We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-text-secondary">
            <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
            <li>To improve our website in order to better serve you.</li>
            <li>To quickly process your transactions.</li>
            <li>To manage your account and provide customer support.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. Security</h2>
          <p className="mb-6">
            We don't share any personally identifying information publicly or with third-parties, except when required to by law. Our platform utilizes industry-standard encryption to protect your data during transit and at rest.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about how we handle user data and personal information, feel free to contact us at privacy@localshop.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
