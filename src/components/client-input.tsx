import SelectBox from "@/components/select-box";
import InputBox from "./input-box";
import InputTable from "./input-table";
import SubmitButton from "./submit-button";

export default function ClientInput() {

  return (
    <div className="mt-8 w-1/2">
      <SelectBox
        labelName="Purlin type"
        fieldName="purlin_types"
        options={[
          {value: "Z8x2.5 060", name: "Z8x2.5 060"}
        ]}
      />
      {/* Need to convert to adjustable list */}
      <InputBox
        labelName="Purlin spans"
        fieldName="purlin_spans"
      />
      <InputBox
        labelName="Lap length"
        fieldName="purlin_laps"
      />
      <InputBox
        labelName="Spacing"
        fieldName="spacing"
      />
      <InputBox
        labelName="Frame flange width"
        fieldName="frame_flange_width"
      />
      <InputBox
        labelName="Roof slope"
        fieldName="roof_slope"
      />
      <SelectBox 
        labelName="Deck type"
        fieldName="deck_type"
        options={[
          {value: "SSR Ultra-DeK 18 in. 24 ga", name: "SSR Ultra-DeK 18 in. 24 ga"}
        ]}
      />
      <InputTable/>
      <SubmitButton/>
    </div>
  );
}