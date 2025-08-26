// server-component and get data from queries.ts and pass it to cards to display
import React, { Suspense } from "react";
import StoryMaker from "./_components/StoryMaker";
import { getStoryTemplateData, getStoryTemplates } from "./lib/queries";
import { StoryData, StoryGroup } from "./types/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Story Maker",
  description: "Story Maker",
};

const Page = async () => {
  const storyTemplates = await getStoryTemplates();
  const storyTemplateData = await getStoryTemplateData();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <StoryMaker
          storyTemplates={storyTemplates as StoryGroup[]}
          storyTemplateData={storyTemplateData as unknown as StoryData[]}
        />
      </Suspense>
    </div>
  );
};

export default Page;
