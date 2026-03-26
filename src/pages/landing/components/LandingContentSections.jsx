import { FEATURES, HOW_IT_WORKS, TESTIMONIALS } from "@/pages/landing/data/landingContent";
import { FeatureCard, StepCard, TestimonialCard } from "@/pages/landing/components/LandingCards";
import { LandingSectionHeader } from "@/pages/landing/components/LandingSectionHeader";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <LandingSectionHeader
        eyebrow="How it works"
        title="From discovery to experience — in 3 steps"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {HOW_IT_WORKS.map((item, index) => (
          <StepCard key={item.step} {...item} index={index} />
        ))}
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <LandingSectionHeader
        eyebrow="Why EventZen"
        title="Everything you need, nothing you don't"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <LandingSectionHeader
        eyebrow="People love it"
        title="What our users say"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
        ))}
      </div>
    </section>
  );
}
