import React from "react";
import Services from "./_components/Services";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Services",
};

const jobPositions = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    companyName: "TechVision",
    companyLogo: "https://cdn.worldvectorlogo.com/logos/react-2.svg",
    location: "San Francisco, CA",
    locationType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "senior",
    postedDate: "2023-09-15",
    salary: "$130,000 - $160,000",
    description:
      "Lead the development of our flagship product using React, TypeScript, and modern web technologies. Join a talented team working on cutting-edge solutions.",
    featured: true,
    highlight: "competitive",
    perks: [
      "Flexible hours",
      "Remote options",
      "Health insurance",
      "401(k) match",
      "Learning budget",
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    companyName: "InnovateCorp",
    companyLogo:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    location: "New York, NY",
    locationType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "senior",
    postedDate: "2023-09-18",
    salary: "$120,000 - $150,000",
    description:
      "Define the product vision and strategy for our SaaS platform. Collaborate with cross-functional teams to deliver exceptional user experiences.",
    featured: true,
    highlight: "new",
    perks: [
      "Unlimited PTO",
      "Health benefits",
      "Remote work options",
      "Stock options",
      "Catered lunches",
    ],
  },
  {
    id: "senior-data-scientist",
    title: "Senior Data Scientist",
    department: "Data Science",
    companyName: "DataDriven",
    companyLogo: "https://cdn.worldvectorlogo.com/logos/python-5.svg",
    location: "Remote",
    locationType: "remote",
    employmentType: "full-time",
    experienceLevel: "senior",
    postedDate: "2023-09-16",
    salary: "$140,000 - $170,000",
    description:
      "Apply machine learning and statistical techniques to solve complex business problems. Work with large datasets to extract insights and drive decision-making.",
    featured: true,
    highlight: "trending",
    perks: [
      "Remote-first culture",
      "Flexible schedule",
      "Quarterly team retreats",
      "Health & wellness stipend",
      "Home office budget",
    ],
  },
  {
    id: "software-architect",
    title: "Software Architect",
    department: "Engineering",
    companyName: "CloudNative",
    companyLogo: "https://cdn.worldvectorlogo.com/logos/aws-2.svg",
    location: "Seattle, WA",
    locationType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "lead",
    postedDate: "2023-09-14",
    salary: "$160,000 - $190,000",
    description:
      "Design and lead the development of scalable, cloud-native applications. Drive technical decisions and mentor junior engineers in best practices.",
    featured: true,
    highlight: "competitive",
    perks: [
      "Competitive salary",
      "Stock options",
      "401(k) with 6% match",
      "Comprehensive healthcare",
      "Professional development budget",
    ],
  },
  {
    id: "ux-design-lead",
    title: "UX Design Lead",
    department: "Design",
    companyName: "CreativeMinds",
    companyLogo: "https://cdn.worldvectorlogo.com/logos/adobe-2.svg",
    location: "Los Angeles, CA",
    locationType: "onsite",
    employmentType: "full-time",
    experienceLevel: "lead",
    postedDate: "2023-09-17",
    salary: "$130,000 - $160,000",
    description:
      "Lead a team of designers to create intuitive, engaging user experiences. Collaborate with product and engineering teams to deliver cohesive products.",
    featured: true,
    highlight: "popular",
    perks: [
      "Creative studio environment",
      "Latest design tools",
      "Healthcare coverage",
      "Gym membership",
      "Casual dress code",
    ],
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    department: "Engineering",
    companyName: "ServerStack",
    companyLogo: "https://cdn.worldvectorlogo.com/logos/nodejs-1.svg",
    location: "Boston, MA",
    locationType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "mid",
    postedDate: "2023-09-20",
    salary: "$115,000 - $140,000",
    description:
      "Develop scalable backend services and APIs using modern technologies. Collaborate with frontend teams to integrate user interfaces.",
    featured: true,
    highlight: "new",
    perks: [
      "Flexible working hours",
      "Remote options",
      "Healthcare",
      "Wellness program",
      "Professional development",
    ],
  },
];

const Page = async () => {
  // replace with actual api data
  // const data = await fetchJobPositions()
  return (
    <div>
      <Services data={jobPositions} />
    </div>
  );
};

export default Page;
