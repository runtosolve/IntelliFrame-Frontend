import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch, INITIAL_PURLIN_STATE } from "./hooks/use-purlin-line";
import React from "react";
import { v4 as uuidv4 } from 'uuid';
import dynamic from "next/dynamic";
import purlinData from "../data/Purlins.json";
import deckData from "../data/Decks.json";
import { generatePurlinViewData } from "./viewer/purlin-view-utils";


const PurlineViewNoSSR = dynamic(() => import("@/components/viewer/purlin-view"), {
  ssr: false,
});
const SectionViewNoSSR = dynamic(() => import("@/components/viewer/section-view"), {
  ssr: false,
});


export default function ClientInput({state, dispatch}: ClientInputProps) {

  return (
    <div className="w-full max-w-screen-md space-y-3 px-4">
      <div className="aspect-video rounded overflow-hidden mb-8">
        <PurlineViewNoSSR
          purlinData={generatePurlinViewData(state.spans, state.lapLength)}
          frameFlangeWidth={state.frameFlangeWidth}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="basis-96 grow space-y-1">
          <LabelledSelectField
            label="Load direction"
            name="loadDirection"
            defaultValue={INITIAL_PURLIN_STATE.loadDirection}
            onChange={(e) => dispatch({
              type: "set",
              field: "loadDirection",
              payload: e.target.value
            })}
          >
            <option value="gravity">
              Gravity
            </option>
            <option value="uplift">
              Uplift
            </option>
          </LabelledSelectField>
          <LabelledInputField
            label="Roof slope (deg.)"
            name="roofSlope"
            defaultValue={INITIAL_PURLIN_STATE.roofSlope.toFixed(2)}
            setField={(v) => dispatch({
              type: "set",
              field: "roofSlope",
              payload: v
            })}
          />
          <LabelledSelectField
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
              <option value={item.value} key={item.value}>
                {item.label}
              </option>  
            )}
          </LabelledSelectField>
          <LabelledSelectField
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
              <option value={item.value} key={item.value}>
                {item.label}
              </option>  
            )}
          </LabelledSelectField>
        </div>
        <div className="basis-48 grow aspect-video relative">
          <SectionViewNoSSR
            purlinName={state.crossSection}
            deckName={state.deckType}
            rotation={-state.roofSlope}
          /> 
        </div>
      </div>
      <DynamicInputFiled
        label="Spans (ft.)"
        name="spans"
        value={state.spans}
        setField={(v) => dispatch({
          type: "set",
          field: "spans",
          payload: v
        })}
      />
      <LabelledInputField
        label="Lap length (ft.)"
        name="lapLength"
        defaultValue={INITIAL_PURLIN_STATE.lapLength.toFixed(2)}
        minValue={0.5}
        setField={(v) => dispatch({
          type: "set",
          field: "lapLength",
          payload: v,
        })}
      />
      <LabelledInputField
        label="Spacing (ft.)"
        name="spacing"
        defaultValue={INITIAL_PURLIN_STATE.spacing.toFixed(2)}
        setField={(v) => dispatch({
          type: "set",
          field: "spacing",
          payload: v,
        })}
      />
      <LabelledInputField
        label="Frame flange width (in.)"
        name="frameFlangeWidth"
        defaultValue={INITIAL_PURLIN_STATE.frameFlangeWidth.toFixed(2)}
        minValue={0.5}
        setField={(v) => dispatch({
          type: "set",
          field: "frameFlangeWidth",
          payload: v,
        })}
      />
    </div>
  );
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
}


const CROSS_SECTION_OPTIONS = purlinData.map(item => {
  return {label: item.name, value: item.name}
});

const DECK_OPTIONS = deckData.map(item => {
  return {label: item.name, value: item.name}
});


