import * as React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WP",
  description: "WP",
};

export default async function IndexPage() {
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to WP</h1>
      <p className="text-gray-600">This is the WP page.</p>
    </div>
  );
}
