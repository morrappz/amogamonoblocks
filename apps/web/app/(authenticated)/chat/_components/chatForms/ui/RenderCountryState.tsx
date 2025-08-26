"use client";
import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import countries from "@/data/countries.json";
import { getStates } from "@/app/(authenticated)/mycontacts/actions";
import { useFormStore } from "../lib/formStore";

const RenderCountryState = ({ form_json }: { form_json: form_json }) => {
  const [country, setCountry] = React.useState("");
  const [selectedState, setSelectedState] = React.useState("");
  const [states, setStates] = React.useState<
    { value: string | null; label: string | null }[]
  >([]);
  const { updateFormData } = useFormStore();

  useEffect(() => {
    const fetchStates = async () => {
      if (country) {
        const states = await getStates(country);
        console.log("states----", states);
        setStates(states);
      } else {
        setStates([]);
      }
    };
    fetchStates();
  }, [country]);

  useEffect(() => {
    if (country && selectedState) {
      updateFormData(
        form_json.name,
        `Country: ${country}, State: ${selectedState}`
      );
    }
  }, [country, selectedState, updateFormData, form_json]);

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="w-full">
        <Label htmlFor="select-country">Select Country</Label>
        <Select value={country} onValueChange={(value) => setCountry(value)}>
          <SelectTrigger value={country} id="select-country">
            Select Country
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full">
        <Label htmlFor="select-state">Select State</Label>
        <Select
          disabled={!country}
          value={selectedState}
          onValueChange={(value) => setSelectedState(value)}
        >
          <SelectTrigger id="select-state">
            {selectedState || "Select State"}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {states.map((state) => (
                <SelectItem key={state.value} value={state.label || ""}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RenderCountryState;
