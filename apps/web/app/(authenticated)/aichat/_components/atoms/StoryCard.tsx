"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface PageProps {
  story_api?: string;
  data: unknown[];
}

const StoryCard = ({ story_api, data }: PageProps) => {
  const [story, setStory] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (story_api) {
      const fetchStory = async () => {
        setLoading(true);
        try {
          const response = await fetch(story_api!);
          const result = await response.json();

          const pugTemplateJson = result[0]?.pug_template_json;
          const storyTemplate = await fetch("/api/story-maker/story-template", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ template: pugTemplateJson, data }),
          });
          const story = await storyTemplate.json();
          setLoading(false);
          if (!story.ok) {
            toast.error("Error creating story");
            return;
          }
          setStory(story?.data);
        } catch (error) {
          toast.error(`Failed Creating Story ${error}`);
        } finally {
          setLoading(false);
        }
      };

      fetchStory();
    }
  }, [story_api, data]);

  if (!story_api || !data) {
    toast.error("Please add story api");
  }

  const speak = (text: string) => {
    if (typeof window !== undefined) {
      const sythesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en_US";
      sythesis.speak(utterance);
    }
  };

  return (
    <div className="w-full mt-2.5">
      <Card className="w-full">
        <CardContent className="p-2 sm:p-4">
          {loading ? (
            <p>Generating Story...</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <div
                className="w-full p-2 sm:p-2.5 rounded-md prose prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{
                  __html: story[currentIndex],
                }}
              />
            </div>
          )}
        </CardContent>
        {story && (
          <div className="flex mb-2.5 relative justify-center items-center gap-2.5">
            <Button
              variant={"outline"}
              disabled={currentIndex === 0}
              size={"icon"}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <span>
              {currentIndex + 1} / {data?.length}
            </span>
            <Button
              disabled={currentIndex === data.length - 1}
              variant={"outline"}
              size={"icon"}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="absolute right-2 bottom-2">
              <Volume2
                onClick={() => speak(story[currentIndex])}
                className="w-5 h-5 text-muted-foreground cursor-pointer"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StoryCard;
