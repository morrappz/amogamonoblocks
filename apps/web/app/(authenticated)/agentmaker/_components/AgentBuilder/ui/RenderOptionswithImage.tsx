import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const RenderOptionswithImage = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  const media_image_url = currentField.media_card_data?.media_url || "";
  const media_html = currentField.media_card_data?.custom_html || "";
  console.log(input);

  useEffect(() => {
    if (media_image_url) {
      setInput(`Media Image: ${media_image_url}, Placeholder: ${media_html}`);
    }
  }, [media_html, media_image_url, setInput]);

  return (
    <div>
      <Label>{currentField.label}</Label>
      <span>{currentField.description}</span>
      <Card className="p-2.5">
        {currentField.media_card_data?.card_type === "Image" && (
          <Image
            src={media_image_url}
            alt="Media Image"
            className="w-full max-h-[300px] object-fill"
            width={500}
            height={200}
          />
        )}
        {currentField.media_card_data?.card_type === "Video" && (
          <video
            src={media_image_url}
            controls
            className="w-full max-h-[300px] object-fill"
          />
        )}
        <div
          className="p-2.5 text-center"
          dangerouslySetInnerHTML={{ __html: media_html }}
        />
        <div className="mt-5 flex gap-5">
          {currentField.chat_with_data?.buttons
            .slice(1)
            .map((button, index) => (
              <div className="w-fit cursor-pointer" key={index}>
                <Button
                  disabled
                  className="rounded-full cursor-pointer"
                  variant={"outline"}
                >
                  <Label>{button.button_text}</Label>
                </Button>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default RenderOptionswithImage;
