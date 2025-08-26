"use client";
import { useState } from "react";
import { form_json } from "../../../types/types";
import { Star } from "lucide-react";

const SendReview = ({
  currentField,
  setInput,
}: {
  currentField: form_json;
  setInput: (value: string) => void;
}) => {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex flex-col space-x-1">
      <p>{currentField.label}</p>
      <div className="flex items-center gap-2.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`text-yellow-500 cursor-pointer
              ${rating >= star ? "fill-yellow-500" : "text-muted-foreground"}`}
            onClick={() => {
              setRating(star);
              setInput(star.toString());
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SendReview;
