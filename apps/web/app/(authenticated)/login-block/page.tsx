import React from "react";
import Login from "./_components/Login";

const Page = () => {
  return (
    <div className="grid h-full  w-full flex-col items-center justify-center bg-background  lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <div className="mb-4 flex items-center justify-center">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default Page;
