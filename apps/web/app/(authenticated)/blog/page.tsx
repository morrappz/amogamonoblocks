import React from "react";
import Blog from "./_components/Blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Blogs",
};

const blogPosts = [
  {
    id: 1,
    title: "How Marketing Analytics is Reshaping Business Strategies",
    category: "Analytics",
    date: "April 18, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    excerpt:
      "Data-driven marketing is changing how companies make decisions. Learn how to leverage analytics for better results.",
  },
  {
    id: 2,
    title: "The Rise of Video Marketing: Why You Can't Ignore It",
    category: "Video",
    date: "April 12, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80",
    excerpt:
      "Video content has become an essential part of modern marketing strategies. Find out why and how to get started.",
  },
  {
    id: 3,
    title: "Building Customer Loyalty Through Content Marketing",
    category: "Content",
    date: "April 5, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    excerpt:
      "Create content that not only attracts but retains customers. Strategies for building long-term relationships through your content.",
  },
  {
    id: 4,
    title: "Social Media Trends That Will Dominate in 2023",
    category: "Social Media",
    date: "March 29, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80",
    excerpt:
      "Stay ahead of the curve with these emerging social media trends that will shape the digital landscape this year.",
  },
  {
    id: 5,
    title: "Email Marketing Personalization: Going Beyond First Name",
    category: "Email",
    date: "March 22, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    excerpt:
      "Advanced techniques for personalizing your email campaigns that go well beyond simply using a subscriber's name.",
  },
  {
    id: 6,
    title: "Sustainable Marketing: Building Eco-Friendly Campaigns",
    category: "Sustainability",
    date: "March 15, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    excerpt:
      "How to integrate sustainability into your marketing strategy and connect with environmentally conscious consumers.",
  },
];

const Page = async () => {
  //replace data with api data
  //   const data = await fetchBlogPosts()
  return (
    <div>
      <Blog data={blogPosts} />
    </div>
  );
};

export default Page;
