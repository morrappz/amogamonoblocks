import React from "react";
import Cards from "./_components/Cards";
import { Metadata } from "next";
import FeaturedProjects from "./_components/FeaturedProjects";
import Banner from "./_components/Banner";
import ProductFeatures from "./_components/ProductFeatures";
import CTASection from "./_components/CTASection";
import PromoSections from "./_components/PromoSections";
import Alerts from "./_components/Alerts";
import DownloadSection from "./_components/DownloadSection";
import SocialCards from "./_components/SocialCards";
import EmailSignUp from "./_components/EmailSignUp";
import EventsList from "./_components/EventsList";

export const metadata: Metadata = {
  title: "Cards",
  description: "Cards",
};

const Page = () => {
  const data = [
    {
      id: 1,
      title: "Create project",
      description: "Deploy your new project in one-click.",
      content:
        "Your new project will be created with the latest version of our framework, complete with authentication, database, and API routes.",
    },
  ];
  return (
    <div>
      <Cards data={data} />
      <FeaturedProjects />
      <ProductFeatures />
      <CTASection />
      <PromoSections />
      <Alerts />
      <h1 className="text-lg text-center">Download Section</h1>
      <DownloadSection />
      <h1 className="text-lg text-center">Social Cards</h1>
      <SocialCards />
      <h1 className="text-lg text-center">Email SignUp</h1>

      <EmailSignUp />
      <h1 className="text-lg text-center">Email SignUp</h1>
      <EventsList />
      <Banner />
    </div>
  );
};

export default Page;
