import NewGroup from "../../_components/Chat/TabPages/Groups/NewGroup";
import React from "react";

const page = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <NewGroup isEdit={false} />
    </div>
  );
};

export default page;
