import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch, INITIAL_PURLIN_STATE } from "./hooks/use-purlin-line";
import React from "react";
import { Card, Tag } from "antd";
import dynamic from "next/dynamic";
import purlinData from "../data/Purlins.json";
import deckData from "../data/Decks.json";
import { generatePurlinViewData } from "./viewer/purlin-view-utils";
import {
  ApartmentOutlined,
  CompassOutlined,
  EyeOutlined,
} from "@ant-design/icons";


const PurlineViewNoSSR = dynamic(() => import("@/components/viewer/purlin-view"), {
  ssr: false,
});
const SectionViewNoSSR = dynamic(() => import("@/components/viewer/section-view"), {
  ssr: false,
});


export function ViewerCard({ state }: { state: PurLinLineState }) {
  return (
    <Card
      title={
        <div className="card-title">
          <EyeOutlined aria-hidden />
          <div>
            <span>Model preview</span>
            <small>Section orientation and purlin layout</small>
          </div>
        </div>
      }
      extra={<Tag variant="filled">{state.spans.length} spans</Tag>}
      className="surface-card preview-card"
    >
      <div className="preview-canvas">
        <div className="preview-section">
          <div className="preview-label">Cross section</div>
          <SectionViewNoSSR
            purlinName={state.crossSection}
            deckName={state.deckType}
            rotation={-state.roofSlope}
          />
        </div>
        <div className="preview-layout">
          <div className="preview-label">Framing layout</div>
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

export default function ClientInput({state, dispatch, part}: ClientInputProps) {
  return (
    <Card
      title={
        <div className="card-title">
          {part === "section" ? <CompassOutlined aria-hidden /> : <ApartmentOutlined aria-hidden />}
          <div>
            <span>{part === "section" ? "Section" : "Geometry"}</span>
            <small>
              {part === "section"
                ? "Load direction, roof slope, cross section, and deck"
                : "Spans, lap, spacing, and support width"}
            </small>
          </div>
        </div>
      }
      className="surface-card input-card"
    >
      {part === "section" && (
        <div className="input-section">
          <div className="form-stack">
            <LabelledSelectField
              label="Load direction"
              name="loadDirection"
              value={state.loadDirection}
              options={LOAD_DIRECTION_OPTIONS}
              onChange={(value) => dispatch({
                type: "set",
                field: "loadDirection",
                payload: value
              })}
            />
            <LabelledInputField
              label="Roof slope"
              unit="deg"
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
        </div>
      )}

      {part === "geometry" && (
      <div className="input-section">
        <div className="form-stack">
          <DynamicInputFiled
            label="Spans"
            unit="ft"
            name="spans"
            value={state.spans}
            setField={(v) => dispatch({
              type: "set",
              field: "spans",
              payload: v
            })}
          />
          <LabelledInputField
            label="Lap length"
            unit="ft"
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
            label="Spacing"
            unit="ft"
            name="spacing"
            defaultValue={INITIAL_PURLIN_STATE.spacing.toFixed(2)}
            setField={(v) => dispatch({
              type: "set",
              field: "spacing",
              payload: v,
            })}
          />
          <LabelledInputField
            label="Frame flange width"
            unit="in"
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
      </div>
      )}
    </Card>
  );
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
  part: "section" | "geometry",
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
