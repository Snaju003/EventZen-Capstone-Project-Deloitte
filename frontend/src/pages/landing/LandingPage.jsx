 import { LandingBottomCta } from "@/pages/landing/components/LandingBottomCta";
import {
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
} from "@/pages/landing/components/LandingContentSections";
import { LandingHeroSection } from "@/pages/landing/components/LandingHeroSection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f9f8f6] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-0 h-[540px] w-[540px] rounded-full bg-blue-100/50 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-amber-100/60 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-100/40 blur-[100px]" />

      <LandingHeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <LandingBottomCta />
    </div>
  );
}
