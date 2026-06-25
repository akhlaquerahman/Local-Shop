import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const ContactUsPage: React.FC = () => {
  return (
    <div className="w-full bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border py-16 text-center px-4">
        <h1 className="text-4xl font-extrabold mb-4">Get in Touch</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Have a question, feedback, or need assistance? Our support team is here to help you 24/7.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Headquarters</h3>
                    <p className="text-text-secondary mt-1">123 Innovation Drive,<br />Tech Park, City 10001, Country</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone Support</h3>
                    <p className="text-text-secondary mt-1">+1 (555) 123-4567</p>
                    <p className="text-xs text-text-secondary mt-1">Mon-Fri from 8am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us</h3>
                    <p className="text-text-secondary mt-1">support@localshop.com</p>
                    <p className="text-text-secondary">partners@localshop.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface rounded-2xl p-8 border border-border shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">First Name</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Last Name</label>
                  <input type="text" className="w-full p-3 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Email Address</label>
                <input type="email" className="w-full p-3 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Message</label>
                <textarea rows={5} className="w-full p-3 rounded-lg bg-background border border-border focus:border-accent outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 mt-4">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
