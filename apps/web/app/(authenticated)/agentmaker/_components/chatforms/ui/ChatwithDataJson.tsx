"use client";
import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFormStore } from "../lib/formStore";

const ChatwithDataJson = ({ form_json }: { form_json: form_json }) => {
  const media_image_url = form_json.media_card_data?.media_url || "";
  const media_html = form_json.media_card_data?.custom_html || "";
  const { updateFormData } = useFormStore();

  useEffect(() => {
    updateFormData(form_json.name, media_image_url);
  }, [form_json, media_image_url, updateFormData]);

  return (
    <div>
      <Label>{form_json.label}</Label>
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
          {form_json.chat_with_data?.buttons.slice(1).map((button, index) => (
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

export default ChatwithDataJson;
