import { MessageCircle, Instagram, Mail, Phone, MapPin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import client from "@/api/client";
import TrustBadges from "./TrustBadges";

const SiteFooter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    setMessage("");
    try {
      await client.post('/subscribers', { email });
      setStatus('success');
      setMessage("You're on the list!");
      setEmail("");
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setTimeout(() => {
        if (status !== 'error') setMessage("");
        setStatus('idle');
      }, 3000);
    }
  };

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
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F4EC]/10 flex items-center justify-center hover:bg-[hsl(44,80%,46%)] transition-colors text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://wa.me/919866425756?text=Hi%2C%20I%20want%20to%20order%20mangoes.%20Is%20it%20available%20today%3F" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#F8F4EC]/10 flex items-center justify-center hover:bg-[hsl(44,80%,46%)] transition-colors text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
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
                  <span>+91 98664 25756</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[hsl(44,80%,46%)] shrink-0" />
                  <span>hello@jamangonow.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[hsl(44,80%,46%)] shrink-0" />
                  <span>Tirupati, Andhra Pradesh,<br />517501</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#F8F4EC]/5 border border-[#F8F4EC]/10 rounded-lg px-4 py-3 text-sm text-[#F8F4EC] focus:outline-none focus:border-[hsl(44,80%,46%)] transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={status === 'loading'}
                  className="bg-[hsl(44,80%,46%)] text-charcoal font-medium py-3 rounded-lg hover:bg-[hsl(44,80%,46%)]/90 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Notify Me'}
                </button>
                {message && (
                  <p className={`text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
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
              <Link to="/admin" className="hover:text-[#F8F4EC]/80 opacity-0 hover:opacity-100 transition-opacity">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
