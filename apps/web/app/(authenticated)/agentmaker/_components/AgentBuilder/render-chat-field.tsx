import { form_json } from "../../types/types";

import RenderTextarea from "./ui/Textarea";
import RenderTextbox from "./ui/Textbox";
import RenderLabel from "./ui/Label";
import RenderSwitch from "./ui/Switch";
import RenderProgress from "./ui/Progress";
import SendReview from "./ui/SendReview";
import RadioOptions from "./ui/RadioOptions";
import FileUpload from "./ui/FileUpload";
import RenderNumericTextbox from "./ui/NumericTextBox";
import RenderCurrencyTextbox from "./ui/CurrencyTextBox";
import DateField from "./ui/DateField";
import RenderStartandEndTime from "./ui/StartandEndTime";
import RenderEmail from "./ui/RenderEmail";
import RenderPhoneInput from "./ui/RenderPhoneInput";
import RenderCountryState from "./ui/RenderCountryState";
import RenderTextBoxwithImage from "./ui/RenderTextBoxwithImage";
import RenderOptionswithImage from "./ui/RenderOptionswithImage";
import ImageUpload from "./ui/ImageUpload";
import RenderRichTextEditor from "./ui/RenderRichTextEditor";

const RenderInputField = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  switch (currentField.variant) {
    case "Label":
      return (
        <RenderLabel
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Text Area":
      return (
        <RenderTextarea
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Text Box":
      return (
        <RenderTextbox
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Numeric Text Box":
      return (
        <RenderNumericTextbox
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Currency Text Box":
      return (
        <RenderCurrencyTextbox
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Date":
      return (
        <DateField
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Start Time and End Time":
      return (
        <RenderStartandEndTime
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Email":
      return (
        <RenderEmail
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Phone":
      return (
        <RenderPhoneInput
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Country and state":
      return (
        <RenderCountryState
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Text Box with Image":
      return (
        <RenderTextBoxwithImage
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );
    case "Options with Image":
      return (
        <RenderOptionswithImage
          currentField={currentField}
          input={input}
          setInput={setInput}
        />
      );

    case "Switch":
      return <RenderSwitch setInput={setInput} currentField={currentField} />;

    case "Slider":
      return <RenderProgress setInput={setInput} currentField={currentField} />;

    case "Ratings":
      return <SendReview setInput={setInput} currentField={currentField} />;

    case "Options":
      return <RadioOptions setInput={setInput} currentField={currentField} />;

    case "File Upload":
      return <FileUpload setInput={setInput} currentField={currentField} />;

    case "Image":
      return <ImageUpload setInput={setInput} currentField={currentField} />;

    case "Rich Text Editor":
      return (
        <RenderRichTextEditor setInput={setInput} currentField={currentField} />
      );

    default:
      return <div>Unsupported Element</div>;
  }
};

export default RenderInputField;
