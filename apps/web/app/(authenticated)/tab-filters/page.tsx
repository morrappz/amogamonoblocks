import React from "react";
import TabFilters from "./_components/TabFilters";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tab Filters",
  description: "Tab Filters",
};

const integrations = [
  {
    name: "Stripe",
    category: "Payment",
    description: "Accept payments from customers worldwide with powerful APIs",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.9,
    popular: true,
    verified: true,
  },
  {
    name: "Slack",
    category: "Communication",
    description: "Team communication and collaboration platform integration",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.8,
    popular: true,
    verified: true,
  },
  {
    name: "GitHub",
    category: "Development",
    description:
      "Version control and collaboration for your development workflow",
    logo: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.9,
    popular: false,
    verified: true,
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    description: "Track and analyze your website traffic and user behavior",
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    popular: false,
    verified: true,
  },
  {
    name: "Mailchimp",
    category: "Marketing",
    description: "Email marketing automation and audience management",
    logo: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.6,
    popular: true,
    verified: true,
  },
  {
    name: "Notion",
    category: "Productivity",
    description: "All-in-one workspace for notes, docs, and project management",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.8,
    popular: false,
    verified: true,
  },
  {
    name: "Zapier",
    category: "Automation",
    description: "Connect your apps and automate workflows without coding",
    logo: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    popular: true,
    verified: true,
  },
  {
    name: "Salesforce",
    category: "CRM",
    description: "Customer relationship management and sales automation",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    popular: false,
    verified: true,
  },
  {
    name: "Discord",
    category: "Communication",
    description: "Voice, video, and text communication for your community",
    logo: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=100&h=100&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    popular: false,
    verified: true,
  },
];

const categories = [
  "All",
  "Payment",
  "Communication",
  "Development",
  "Analytics",
  "Marketing",
  "Productivity",
];

const Page = () => {
  return (
    <div>
      <TabFilters data={integrations} categories={categories} />
    </div>
  );
};

export default Page;
