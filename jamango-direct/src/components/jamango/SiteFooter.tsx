import { MessageCircle, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import TrustBadges from "./TrustBadges";

const SiteFooter = () => {
  return (
    <footer>
      <TrustBadges />
      <div className="relative bg-[hsl(80,45%,15%)] text-[#F8F4EC]">
        {/* 2. Main Footer Content - Starts immediately now */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="grid md:grid-cols-4 gap-12 mb-16">

            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
              <h2 className="font-display text-3xl mb-4 text-[#F8F4EC]">JAMANGO</h2>
              <p className="text-[hsl(44,80%,46%)] font-medium text-xs tracking-[0.2em] uppercase mb-6">
                House of Munagala
              </p>
              <p className="text-[#F8F4EC]/60 text-sm leading-relaxed mb-6 font-body">
                Generations of expertise in cultivating the finest Alphonso mangoes. Naturally ripened, chemical-free, and delivered fresh.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F4EC]/10 flex items-center justify-center hover:bg-[hsl(44,80%,46%)] transition-colors text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F4EC]/10 flex items-center justify-center hover:bg-[hsl(44,80%,46%)] transition-colors text-white">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-xl mb-6 text-[#F8F4EC]">Quick Links</h4>
              <ul className="space-y-4 font-body text-sm text-[#F8F4EC]/70">
                <li><a href="#" className="hover:text-[hsl(44,80%,46%)] transition-colors">Home</a></li>
                <li><a href="#products" className="hover:text-[hsl(44,80%,46%)] transition-colors">Shop Collection</a></li>
                <li><a href="#story" className="hover:text-[hsl(44,80%,46%)] transition-colors">Our Story</a></li>
                <li><a href="#delivery" className="hover:text-[hsl(44,80%,46%)] transition-colors">Delivery Info</a></li>
                <li><Link to="/blogs" className="hover:text-[hsl(44,80%,46%)] transition-colors">Mango Chronicles</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-xl mb-6 text-[#F8F4EC]">Contact Us</h4>
              <ul className="space-y-4 font-body text-sm text-[#F8F4EC]/70">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[hsl(44,80%,46%)] shrink-0" />
                  <span>+91 99999 99999</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[hsl(44,80%,46%)] shrink-0" />
                  <span>hello@jamango.in</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[hsl(44,80%,46%)] shrink-0" />
                  <span>Indiranagar, Bengaluru,<br />Karnataka 560038</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-display text-xl mb-6 text-[#F8F4EC]">Harvest Alerts</h4>
              <p className="text-[#F8F4EC]/60 text-sm mb-4 font-body">
                Be the first to know when fresh stock arrives.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-[#F8F4EC]/5 border border-[#F8F4EC]/10 rounded-lg px-4 py-3 text-sm text-[#F8F4EC] focus:outline-none focus:border-[hsl(44,80%,46%)] transition-colors"
                />
                <button className="bg-[hsl(44,80%,46%)] text-charcoal font-medium py-3 rounded-lg hover:bg-[hsl(44,80%,46%)]/90 transition-colors text-sm">
                  Notify Me
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#F8F4EC]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F8F4EC]/40 font-body">
            <p>© {new Date().getFullYear()} JAMANGO. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-[#F8F4EC]/80">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-[#F8F4EC]/80">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-[#F8F4EC]/80">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
