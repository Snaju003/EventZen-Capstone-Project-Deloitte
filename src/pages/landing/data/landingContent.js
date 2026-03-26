import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";

export const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Discover Events",
    description:
      "Browse our curated catalogue of published events. Filter by venue, date, or keyword to find exactly what you're looking for.",
    cta: "Browse events",
    href: "/events",
  },
  {
    step: "02",
    icon: Ticket,
    title: "Reserve Your Seat",
    description:
      "Pick an event, review the details, and secure your place in seconds. No hidden fees — just transparent pricing upfront.",
    cta: "Get started",
    href: "/auth",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Show Up & Enjoy",
    description:
      "Your booking is instantly confirmed. Turn up, present your ticket, and enjoy a seamless event experience.",
    cta: null,
    href: null,
  },
];

export const FEATURES = [
  {
    icon: CalendarDays,
    title: "Live event catalogue",
    description:
      "Every event is reviewed and published by our admin team, so you only see real, upcoming experiences.",
  },
  {
    icon: MapPin,
    title: "Venue-aware discovery",
    description:
      "Filter by venue to find events near you or at your favourite space. Each listing includes full venue details.",
  },
  {
    icon: Users,
    title: "Capacity transparency",
    description:
      "See exactly how many seats remain before you commit. No surprises — booking is only possible while seats are available.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & verified",
    description:
      "OTP-based email verification protects every account. Your booking history, profile, and payments are always safe.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Priya M.",
    role: "Regular Attendee",
    text: "Found a photography workshop I didn't know existed. Booked in two minutes. Showed up, loved it.",
  },
  {
    name: "Rahul S.",
    role: "Tech Conference Organiser",
    text: "The vendor dashboard made coordinating three AV vendors for our annual conference completely painless.",
  },
  {
    name: "Ananya K.",
    role: "Cultural Festival Attendee",
    text: "I love how clean the event pages are. All the information I need — date, venue, price — right there.",
  },
];

export const HERO_MOCK_CARDS = [
  { color: "from-blue-500 to-indigo-600", title: "Tech Summit 2026", venue: "Convention Centre", price: "INR 1,499", date: "Apr 12" },
  { color: "from-rose-500 to-pink-600", title: "Jazz Night Live", venue: "Harmony Hall", price: "INR 799", date: "Apr 18" },
  { color: "from-emerald-500 to-teal-600", title: "Design Workshop", venue: "Studio 9", price: "INR 599", date: "Apr 22" },
  { color: "from-amber-500 to-orange-500", title: "Startup Showcase", venue: "Hub Arena", price: "INR 299", date: "Apr 28" },
];
