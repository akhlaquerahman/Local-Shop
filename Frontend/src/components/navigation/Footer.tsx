import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto w-full relative overflow-hidden shrink-0 z-10">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
              Local Shop
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Empowering local businesses and connecting communities through a seamless, hyper-local shopping experience.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-text-secondary hover:bg-accent hover:text-white transition-all transform hover:scale-110">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-text-secondary hover:bg-accent hover:text-white transition-all transform hover:scale-110">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-text-secondary hover:bg-accent hover:text-white transition-all transform hover:scale-110">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-text-secondary hover:bg-accent hover:text-white transition-all transform hover:scale-110">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-colors"></span>
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-text-secondary">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <span>123 Innovation Drive,<br />Tech Park, City 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <Phone size={18} className="text-accent shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-secondary">
                <Mail size={18} className="text-accent shrink-0" />
                <a href="mailto:support@localshop.com" className="hover:text-accent transition-colors">support@localshop.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Local Shop Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>Secured with SSL</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
