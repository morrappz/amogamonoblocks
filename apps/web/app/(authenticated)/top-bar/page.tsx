import React from "react";
import Topbar from "./_components/Topbar";

const data = {
  title: "Introducing our new UI blocks",
  description: "Get started with 50+ new components.",
};

const Page = () => {
  return (
    <div>
      <Topbar data={data} />
    </div>
  );
};

export default Page;
