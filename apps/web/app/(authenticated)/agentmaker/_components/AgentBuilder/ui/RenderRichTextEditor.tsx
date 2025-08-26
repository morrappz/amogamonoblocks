import React from "react";
import { form_json } from "../../../types/types";
import RichTextEditor from "@/components/RichTextEditor";

const RenderRichTextEditor = ({}: //   setInput,
//   currentField,
{
  setInput?: (value: string) => void;
  currentField?: form_json;
}) => {
  return (
    <div>
      <RichTextEditor />
    </div>
  );
};

export default RenderRichTextEditor;
