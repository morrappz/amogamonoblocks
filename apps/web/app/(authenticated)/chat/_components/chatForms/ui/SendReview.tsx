"use client";
import { useState } from "react";
import { form_json } from "../../../types/types";
import { Star } from "lucide-react";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const SendReview = ({ form_json }: { form_json: form_json }) => {
  const [rating, setRating] = useState(0);
  const { updateFormData } = useFormStore();

  return (
    <div className="flex flex-col space-x-1">
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex items-center mt-2.5 gap-2.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`text-yellow-500 cursor-pointer
              ${rating >= star ? "fill-yellow-500" : "text-muted-foreground"}`}
            onClick={() => {
              setRating(star);
              updateFormData(form_json.name, star.toString());
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SendReview;
