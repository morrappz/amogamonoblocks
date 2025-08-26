import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useFormStore } from "../lib/formStore";

const RenderTextBoxwithImage = ({ form_json }: { form_json: form_json }) => {
  const { updateFormData } = useFormStore();

  const media_image_url = form_json?.media_card_data?.media_url || "";
  const media_html = form_json.media_card_data?.custom_html || "";

  useEffect(() => {
    if (media_image_url && media_html) {
      updateFormData(
        form_json.name,
        `Media Image: ${media_image_url}, Placeholder: ${media_html}`
      );
    }
  }, [media_html, media_image_url, form_json, updateFormData]);

  return (
    <div>
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <span>{form_json.description}</span>
      <Card className="p-2.5">
        {form_json.media_card_data?.card_type === "Image" && (
          <Image
            src={media_image_url}
            alt="Media Image"
            className="w-full max-h-[300px] object-fill"
            width={400}
            height={300}
          />
        )}
        {form_json.media_card_data?.card_type === "Video" && (
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
