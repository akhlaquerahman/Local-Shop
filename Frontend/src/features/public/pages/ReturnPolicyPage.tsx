import React from 'react';

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="w-full bg-background pb-20">
      <div className="bg-surface border-b border-border py-16 text-center px-4">
        <h1 className="text-4xl font-extrabold mb-4">Return & Refund Policy</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          We want you to be completely satisfied with your purchase.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-p:text-text-secondary prose-h2:text-foreground max-w-none">
          <p className="lead text-lg mb-8">
            Thank you for shopping at Local Shop. If, for any reason, you are not completely satisfied with a purchase, we invite you to review our policy on refunds and returns.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Conditions for Returns</h2>
          <p className="mb-6">
            In order for the Goods to be eligible for a return, please make sure that:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-text-secondary">
            <li>The Goods were purchased in the last 7 days.</li>
            <li>The Goods are in the original packaging.</li>
            <li>The Goods were not used or damaged.</li>
            <li>You have the receipt or proof of purchase.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Non-Returnable Items</h2>
          <p className="mb-6">
            The following Goods cannot be returned:
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-text-secondary">
            <li>The supply of Goods made to Your specifications or clearly personalized.</li>
            <li>The supply of Goods which according to their nature are not suitable to be returned, deteriorate rapidly or where the date of expiry is over.</li>
            <li>The supply of Goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Returning Goods</h2>
          <p className="mb-6">
            You can initiate a return request directly from your "My Orders" page. Once approved by the seller, a local delivery partner will be assigned to pick up the item from your address. You will be notified of the pickup schedule.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Refunds</h2>
          <p className="mb-6">
            We will reimburse you no later than 14 days from the day on which we receive the returned Goods. We will use the same means of payment as you used for the Order, and you will not incur any fees for such reimbursement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
