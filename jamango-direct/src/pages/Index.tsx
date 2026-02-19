import SiteHeader from "@/components/jamango/SiteHeader";
import HeroSection from "@/components/jamango/HeroSection";
import BrandStory from "@/components/jamango/BrandStory";
import ProductCards from "@/components/jamango/ProductCards";

import DeliveryInfo from "@/components/jamango/DeliveryInfo";
import SiteFooter from "@/components/jamango/SiteFooter";
import StickyWhatsApp from "@/components/jamango/StickyWhatsApp";
import FinalCTA from "@/components/jamango/FinalCTA";
import VarietyGuide from "@/components/jamango/VarietyGuide";
import OrderingOptions from "@/components/jamango/OrderingOptions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Variety Guide */}
        <div id="varieties">
          <VarietyGuide />
        </div>

        {/* 3. Product Collection */}
        <ProductCards />

        {/* 4. Delivery Section */}
        <div id="delivery">
          <DeliveryInfo />
        </div>

        {/* 5. Ordering Options */}
        <OrderingOptions />



        {/* 7. Brand Story */}
        <div id="story">
          <BrandStory />
        </div>

        {/* 8. Final CTA Section */}
        <FinalCTA />
      </main>
      <SiteFooter />
      <StickyWhatsApp />
    </div>
  );
};

export default Index;
