import DynamicInputFiled from "./form-input/dynamic-input-field";
import InputField from "./form-input/input-field";
import SelectField from "./form-input/select-field";
import usePurlinLine, { INITIAL_STATE } from "./hooks/use-purlin-line";
import PurlinView from "./purlin-view";
import React from "react";
import { v4 as uuidv4 } from 'uuid';

export default function ClientInput() {

  const [state, dispatch] = usePurlinLine()

  return (
    <div className="mt-8 w-1/2 space-y-3">
      <PurlinView/>
      <InputField
        label="Roof slope (deg.)"
        name="roofSlope"
        defaultValue={INITIAL_STATE.roofSlope.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "roofSlope",
          payload: v
        })}
      />
      <SelectField
        label="Deck type"
        name="deckType"
        value={state.deckType}
        onChange={(e) => dispatch({
          type: "set",
          field: "deckType",
          payload: e.target.value
        })}
      >
        {DECK_OPTIONS.map(item => 
          <option value={item.value} key={uuidv4()}>
            {item.label}
          </option>  
        )}
      </SelectField>
      <SelectField
        label="Cross section"
        name="crossSection"
        value={state.crossSection}
        onChange={(e) => dispatch({
          type: "set",
          field: "crossSection",
          payload: e.target.value
        })}
      >
        {CROSS_SECTION_OPTIONS.map(item => 
          <option value={item.value} key={uuidv4()}>
            {item.label}
          </option>  
        )}
      </SelectField>
      <DynamicInputFiled
        label="Span (ft.)"
        name="span"
      />
      <InputField
        label="Lap length (in.)"
        name="lapLength"
        defaultValue={INITIAL_STATE.lapLength.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "lapLength",
          payload: v,
        })}
      />
      <InputField
        label="Spacing (ft.)"
        name="spacing"
        defaultValue={INITIAL_STATE.spacing.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "spacing",
          payload: v,
        })}
      />
      <InputField
        label="Frame flange width (in.)"
        name="frameFlangeWidth"
        defaultValue={INITIAL_STATE.frameFlangeWidth.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "frameFlangeWidth",
          payload: v,
        })}
      />
    </div>
  );
}

const CROSS_SECTION_OPTIONS = [
  {label: "Z8x2.5 060", value: "Z8x2.5 060"},
  {label: "Z8x2.5 080", value: "Z8x2.5 080"}
]

const DECK_OPTIONS = [
  {label: "SSR Ultra-Dek 18 in. 24 ga", value: "SSR Ultra-Dek 18 in. 24 ga"},
  {label: "SSR Ultra-Dek 20 in. 24 ga", value: "SSR Ultra-Dek 20 in. 24 ga"}
]

