import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch, INITIAL_PURLIN_STATE } from "./hooks/use-purlin-line";
import React from "react";
import { Card } from "antd";
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


export function ViewerCard({ state }: { state: PurLinLineState }) {
  return (
    <Card title="Preview" className="shadow-sm panel-teal">
      <div className="bg-[#fafafa] border border-[#eeeeee] rounded-md p-3">
        <div className="relative h-64">
          <SectionViewNoSSR
            purlinName={state.crossSection}
            deckName={state.deckType}
            rotation={-state.roofSlope}
          />
        </div>
        <div className="h-64">
          <PurlineViewNoSSR
            purlinData={generatePurlinViewData(state.spans, state.lapLength)}
            frameFlangeWidth={state.frameFlangeWidth}
            loadDirection={state.loadDirection}
          />
        </div>
      </div>
    </Card>
  );
}

export default function ClientInput({state, dispatch}: ClientInputProps) {

  return (
    <div className="w-full space-y-6">
      <Card title="Section" className="shadow-sm panel-blue">
        <div className="space-y-4">
          <LabelledSelectField
            label="Load direction"
            name="loadDirection"
            defaultValue={INITIAL_PURLIN_STATE.loadDirection}
            options={LOAD_DIRECTION_OPTIONS}
            onChange={(value) => dispatch({
              type: "set",
              field: "loadDirection",
              payload: value
            })}
          />
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
            options={CROSS_SECTION_OPTIONS}
            onChange={(value) => dispatch({
              type: "set",
              field: "crossSection",
              payload: value
            })}
          />
          <LabelledSelectField
            label="Deck type"
            name="deckType"
            value={state.deckType}
            options={DECK_OPTIONS}
            onChange={(value) => dispatch({
              type: "set",
              field: "deckType",
              payload: value
            })}
          />
        </div>
      </Card>
      <Card title="Geometry" className="shadow-sm panel-green">
        <div className="space-y-4">
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
      </Card>
    </div>
  );
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
}


const LOAD_DIRECTION_OPTIONS = [
  { label: "Gravity", value: "gravity" },
  { label: "Uplift", value: "uplift" },
];

const CROSS_SECTION_OPTIONS = purlinData.map(item => {
  return {label: item.name, value: item.name}
});

const DECK_OPTIONS = deckData.map(item => {
  return {label: item.name, value: item.name}
});
