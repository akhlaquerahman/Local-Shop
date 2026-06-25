import React from 'react';
import { Shield, Target, Users, Zap } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="w-full bg-background relative pb-20">
      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background -z-10" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Empowering <span className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">Local Communities</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
          We bridge the gap between neighborhood stores and local buyers, creating a hyper-local ecosystem that thrives on convenience, speed, and trust.
        </p>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: 'Community First', desc: 'We prioritize local businesses and ensure money stays within the community.' },
            { icon: Zap, title: 'Hyper-Local Speed', desc: 'Deliveries in minutes, not days. Brought to you by riders in your neighborhood.' },
            { icon: Shield, title: 'Trust & Transparency', desc: 'Verified sellers, authentic reviews, and secure transactions always.' },
            { icon: Target, title: 'Empowering Sellers', desc: 'Providing top-tier digital tools for mom-and-pop shops to compete globally.' },
          ].map((val, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface border border-border/50 hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <val.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{val.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-surface to-surface border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            To digitize the world's local commerce by providing an intuitive, accessible, and powerful platform that connects buyers, sellers, and delivery partners seamlessly in real-time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
