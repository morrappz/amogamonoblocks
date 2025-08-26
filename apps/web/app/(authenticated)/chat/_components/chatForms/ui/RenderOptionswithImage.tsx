import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useFormStore } from "../lib/formStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const RenderOptionswithImage = ({ form_json }: { form_json: form_json }) => {
  const media_image_url = form_json.media_card_data?.media_url || "";
  const media_html = form_json.media_card_data?.custom_html || "";

  const { formData, updateFormData } = useFormStore();

  useEffect(() => {
    if (media_image_url) {
      updateFormData(
        form_json.name,
        `Media Image: ${media_image_url}, Placeholder: ${media_html}`
      );
    }
  }, [media_html, media_image_url, updateFormData, form_json]);

  console.log("data----", formData);

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
            width={500}
            height={200}
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
        <div className="mt-5 flex gap-5">
          <RadioGroup
            className="flex gap-2.5"
            onValueChange={(value) => updateFormData(form_json.name, value)}
          >
            {form_json.chat_with_data?.buttons.slice(1).map((button, index) => (
              <div
                className="w-fit cursor-pointer p-2.5 flex border rounded-full"
                key={index}
              >
                <RadioGroupItem
                  id={index.toString()}
                  value={button.button_text}
                />
                <Label htmlFor={index.toString()} className="ml-2">
                  {button.button_text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Card>
    </div>
  );
};

export default RenderOptionswithImage;
