import React from "react";

import RenderLabel from "./ui/Label";
import RenderTextarea from "./ui/Textarea";
import SendMediaCard from "./ui/SendMediaCard";
import ChatwithDataJson from "./ui/ChatwithDataJSON";
import { form_json } from "../../types/types";
import RenderTextbox from "./ui/RenderTextBox";
import RenderNumericTextbox from "./ui/NumericTextBox";
import RenderCurrencyTextbox from "./ui/CurrencyTextBox";
import DateField from "./ui/DateField";
import RenderStartandEndTime from "./ui/StartandEndTime";
import RenderEmail from "./ui/RenderEmail";
import RenderPhoneInput from "./ui/RenderPhoneInput";
import RenderCountryState from "./ui/RenderCountryState";
import RenderTextBoxwithImage from "./ui/RenderTextBoxwithImage";
import RenderOptionswithImage from "./ui/RenderOptionswithImage";
import RenderSwitch from "./ui/Switch";
import RenderProgress from "./ui/Progress";
import SendReview from "./ui/SendReview";
import RadioOptions from "./ui/RadioOptions";
import FileUpload from "./ui/FileUpload";
import ImageUpload from "./ui/ImageUpload";

const RenderChatForms = ({ form_json }: { form_json: form_json }) => {
  switch (form_json?.variant) {
    case "Text Area":
      return <RenderTextarea form_json={form_json} />;
    case "Text Box":
      return <RenderTextbox form_json={form_json} />;
    case "Label":
      return <RenderLabel form_json={form_json} />;
    case "Numeric Text Box":
      return <RenderNumericTextbox form_json={form_json} />;
    case "Currency Text Box":
      return <RenderCurrencyTextbox form_json={form_json} />;
    case "Date":
      return <DateField form_json={form_json} />;
    case "Start Time and End Time":
      return <RenderStartandEndTime form_json={form_json} />;
    case "Email":
      return <RenderEmail form_json={form_json} />;
    case "Phone":
      return <RenderPhoneInput form_json={form_json} />;
    case "Country and state":
      return <RenderCountryState form_json={form_json} />;
    case "Text Box with Image":
      return <RenderTextBoxwithImage form_json={form_json} />;
    case "Options with Image":
      return <RenderOptionswithImage form_json={form_json} />;

    case "Switch":
      return <RenderSwitch form_json={form_json} />;

    case "Slider":
      return <RenderProgress form_json={form_json} />;

    case "Ratings":
      return <SendReview form_json={form_json} />;

    case "Options":
      return <RadioOptions form_json={form_json} />;

    case "File Upload":
      return <FileUpload form_json={form_json} />;

    case "Image":
      return <ImageUpload form_json={form_json} />;
    case "Send Media Card":
      return <SendMediaCard form_json={form_json} />;
    case "Chat with Data JSON":
      return <ChatwithDataJson form_json={form_json} />;
    default:
      return <div>Unsupported field</div>;
  }
};

export default RenderChatForms;
