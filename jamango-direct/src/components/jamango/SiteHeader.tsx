import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const location = useLocation();
  const darkRoutes = ["/blogs", "/my-orders", "/order-success", "/checkout"];
  const isDarkRoute = darkRoutes.includes(location.pathname) || location.pathname.includes("order");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useDarkText = scrolled || isDarkRoute;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/#products" },
    { label: "My Orders", href: "/my-orders" },
    { label: "Delivery", href: "/#delivery" },
    { label: "Our Story", href: "/#story" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const targetId = href.replace('/#', '');

      const scrollWithOffset = () => {
        const element = document.getElementById(targetId);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      };

      scrollWithOffset();
      setMobileOpen(false);

      // Robust layout shift correction: Recalculate and adjust scroll if dynamic components (like ProductCards) shifted the anchor while scrolling
      setTimeout(scrollWithOffset, 300);
      setTimeout(scrollWithOffset, 800);
    } else if (href.startsWith('/#')) {
      // If we are on another page, let the native or router navigation happen
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[hsl(40,50%,95%)]/95 backdrop-blur-md shadow-sm border-b border-[hsl(44,80%,46%)]/10" : "bg-transparent h-24"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20 mt-2">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpeg"
            alt="JAMANGO Logo"
            className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm rounded-full bg-white/20 p-0.5"
          />
          <div className="flex flex-col">
            <span className={`font-display text-2xl font-bold tracking-[0.15em] uppercase leading-none transition-colors duration-300 drop-shadow-sm ${useDarkText ? "text-charcoal" : "text-white"}`}>
              JAMANGO
            </span>
            <span className={`text-[10px] uppercase tracking-[0.3em] font-medium transition-colors duration-300 ${useDarkText ? "text-[hsl(44,80%,46%)]" : "text-white/80"}`}>
              PureCraft
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`relative font-body text-sm font-medium transition-colors duration-300 group py-1 ${useDarkText ? "text-muted-foreground hover:text-charcoal" : "text-white/90 hover:text-white"}`}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[hsl(44,80%,46%)] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 font-medium px-4 py-2 rounded-full transition-all ${useDarkText ? "text-charcoal hover:bg-stone-100" : "text-white hover:bg-white/10"}`}>
                  <User className="h-4 w-4" />
                  <span>{user.name.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm mt-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <a
            href="/#products"
            onClick={(e) => handleNavClick(e, '/#products')}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[hsl(44,80%,46%)] text-white font-medium text-sm rounded-full shadow-lg shadow-[hsl(44,80%,46%)]/20 hover:shadow-xl hover:shadow-[hsl(44,80%,46%)]/40 hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative z-10">Order Harvest</span>
          </a>

          <Link
            to="/checkout"
            className={`relative p-2 rounded-full transition-colors ${useDarkText ? "text-charcoal hover:bg-stone-100" : "text-white hover:bg-white/10"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[hsl(44,90%,50%)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className={`md:hidden transition-colors ${useDarkText ? "text-charcoal" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {
        mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[hsl(40,50%,95%)] border-b border-border px-6 py-6 space-y-6 shadow-xl overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block font-display text-2xl text-charcoal hover:text-[hsl(44,80%,46%)]"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-charcoal/10 pt-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 text-lg font-medium text-charcoal">
                    <User className="h-5 w-5" />
                    <span>Hi, {user.name}</span>
                  </div>
                  {user.isAdmin && (
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-charcoal/80 hover:text-charcoal">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-red-600 block w-full text-left">
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-charcoal hover:text-[hsl(44,80%,46%)]">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-charcoal/60 hover:text-charcoal">
                    Register
                  </Link>
                </div>
              )}
            </div>

            <a
              href="/#products"
              onClick={(e) => handleNavClick(e, '/#products')}
              className="w-full py-4 bg-[hsl(44,80%,46%)] text-white font-medium text-lg rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-[hsl(44,80%,46%)]/90"
            >
              Order Harvest
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        )
      }
    </motion.header >
  );
};

export default SiteHeader;
