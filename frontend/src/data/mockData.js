export const features = [
  {
    id: 1,
    title: "Clinic Digitalization",
    description: "Transform your clinic with end-to-end digital tools—from paperless records to streamlined workflows that modernize operations.",
    icon: "Calendar",
    image: "https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8"
  },
  {
    id: 2,
    title: "Revenue Operations",
    description: "Record payment logs and track patient bills. Monitor patient spend, run analytics, and turn data into actionable strategies for your practice.",
    icon: "BarChart3",
    image: "https://images.unsplash.com/photo-1543910556-bb42a926e975"
  },
  {
    id: 3,
    title: "Patient Management Software",
    description: "Centralized platform for patient records, treatment history, and care tracking. One place to manage your entire patient base.",
    icon: "Users",
    image: "https://images.unsplash.com/photo-1600721187850-c944924fd48a"
  },
  {
    id: 4,
    title: "Schedule & Record",
    description: "Smart scheduling plus seamless record-keeping. Book appointments, log visits, and maintain accurate patient history in one system.",
    icon: "Calendar",
    image: "https://images.unsplash.com/photo-1642844819197-5f5f21b89ff8"
  },
  {
    id: 5,
    title: "Nurture & Retain",
    description: "Automated follow-ups, reminders, and nurture campaigns. Keep clients engaged and coming back with personalized touchpoints.",
    icon: "MessageSquare",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787"
  },
  {
    id: 6,
    title: "Compliance & Security",
    description: "HIPAA-compliant infrastructure with enterprise-grade security, encrypted records, and automatic backups for patient data.",
    icon: "Shield",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09"
  }
];

export const pricingPlans = [
  {
    id: 1,
    name: "Starter",
    price: "₱5,000",
    period: "/month",
    description: "Perfect for solo practitioners and small practices",
    features: [
      "Up to 2 providers",
      "500 patient records",
      "Digital scheduling & records",
      "Patient management software",
      "Patient portal",
      "Email & WhatsApp support"
    ],
    popular: false
  },
  {
    id: 2,
    name: "Pro",
    price: "₱12,000",
    period: "/month",
    description: "Ideal for growing practices with multiple providers",
    features: [
      "Up to 5 providers",
      "1,500 patient records",
      "Digital scheduling & records",
      "Patient management software",
      "Patient portal",
      "Email & WhatsApp support",
      "Revenue operations & analytics",
      "Dedicated account manager"
    ],
    popular: true
  },
  {
    id: 3,
    name: "Enterprise",
    price: "₱15,000",
    period: "/month",
    description: "Comprehensive solution for multi-location practices",
    features: [
      "Up to 15 providers",
      "3,000 patient records",
      "Digital scheduling & records",
      "Patient management software",
      "Patient portal",
      "Email & WhatsApp support",
      "Revenue operations & insights",
      "Complete clinic digitalization",
      "Advanced patient management",
      "Multi-location management",
      "Dedicated account manager"
    ],
    popular: false
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    role: "Practice Owner, Bright Smile Dental",
    content: "This system transformed how we operate. Appointment no-shows dropped by 65% and our team saves 15 hours per week on administrative tasks.",
    avatar: "SM",
    rating: 5,
    location: "San Francisco, CA"
  },
  {
    id: 2,
    name: "Dr. James Chen",
    role: "Chief Dentist, Metro Dental Group",
    content: "The AI scheduling is incredible. It optimizes our daily schedule automatically and has increased our patient throughput by 30% without adding staff.",
    avatar: "JC",
    rating: 5,
    location: "New York, NY"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Managing Partner, Family Dental Care",
    content: "We manage 4 locations seamlessly now. Real-time analytics help us make data-driven decisions that have boosted our revenue by 40%.",
    avatar: "ER",
    rating: 5,
    location: "Austin, TX"
  }
];

export const benefits = [
  {
    id: 1,
    metric: "65%",
    label: "Reduction in No-Shows",
    description: "Automated reminders and smart scheduling"
  },
  {
    id: 2,
    metric: "15hrs",
    label: "Saved Per Week",
    description: "Streamlined administrative workflows"
  },
  {
    id: 3,
    metric: "30%",
    label: "Increase in Revenue",
    description: "Optimized scheduling and patient retention"
  },
  {
    id: 4,
    metric: "99.9%",
    label: "Uptime Guarantee",
    description: "Enterprise-grade reliability"
  }
];

export const comparisonFeatures = [
  { name: "Patient Limitation", basic: "500", pro: "1,500", enterprise: "3,000" },
  { name: "Account Limitation", basic: "2", pro: "5", enterprise: "15" },
  { name: "Appointment Scheduling", basic: true, pro: true, enterprise: true },
  { name: "Patient Records", basic: true, pro: true, enterprise: true },
  { name: "Staff Management", basic: true, pro: true, enterprise: true },
  { name: "Reports & Analytics", basic: true, pro: true, enterprise: true },
  { name: "Patient Portal", basic: true, pro: true, enterprise: true },
  { name: "Accounts", basic: "Email & WhatsApp", pro: "Dedicated account manager", enterprise: "Dedicated account manager" },
  { name: "Multi-Location Support", basic: false, pro: false, enterprise: true }
];
