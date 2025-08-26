import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const RenderTextBoxwithImage = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  console.log("currentField------", currentField);
  const media_image_url = currentField?.media_card_data?.media_url || "";
  const media_html = currentField.media_card_data?.custom_html || "";

  console.log(input);
  useEffect(() => {
    if (media_image_url && media_html) {
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
            width={400}
            height={300}
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
      </Card>
    </div>
  );
};

export default RenderTextBoxwithImage;
