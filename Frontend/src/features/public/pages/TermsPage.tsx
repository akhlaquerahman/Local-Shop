import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="w-full bg-background pb-20">
      <div className="bg-surface border-b border-border py-16 text-center px-4">
        <h1 className="text-4xl font-extrabold mb-4">Terms of Service</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Last updated: October 2023
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-p:text-text-secondary prose-h2:text-foreground max-w-none">
          <p className="lead text-lg mb-8">
            By accessing or using the Local Shop platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">1. Account Terms</h2>
          <p className="mb-6">
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. Purchases and Payments</h2>
          <p className="mb-6">
            If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, and your billing address.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. Content and Conduct</h2>
          <p className="mb-6">
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Termination</h2>
          <p className="mb-6">
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
