import React from "react";
import { form_json } from "../../types/types";
import RenderLabel from "./ui/Label";
import RenderTextarea from "./ui/Textarea";
import SendMediaCard from "./ui/SendMediaCard";
import ChatwithDataJson from "./ui/ChatwithDataJSON";

const RenderChatForms = ({ form_json }: { form_json: form_json }) => {
  console.log("form_json-----", form_json.variant);

  switch (form_json?.variant) {
    case "Text Area":
      return <RenderTextarea form_json={form_json} />;
    case "Label":
      return <RenderLabel form_json={form_json} />;
    case "Send Media Card":
      return <SendMediaCard form_json={form_json} />;
    case "Chat with Data JSON":
      return <ChatwithDataJson form_json={form_json} />;
    default:
      return <div>Unsupported field</div>;
  }
};

export default RenderChatForms;
