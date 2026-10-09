import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch, INITIAL_PURLIN_STATE } from "./hooks/use-purlin-line";
import React from "react";
import { Card, Tag } from "antd";
import dynamic from "next/dynamic";
import purlinData from "../data/Purlins.json";
import intelliFrameData from "../data/IntelliFrameRF.json";
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


export function ViewerCard({ state, loadDirection = state.loadDirection, sectionCatalog = "purlin" }: ViewerCardProps) {
  const sectionName = sectionCatalog === "intelliframe" ? state.intelliFrameSection : state.crossSection;
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
            purlinName={sectionName}
            deckName={state.deckType}
            catalog={sectionCatalog}
            rotation={-state.roofSlope}
          />
        </div>
        <div className="preview-layout">
          <div className="preview-label">Framing layout</div>
          <PurlineViewNoSSR
            purlinData={generatePurlinViewData(state.spans, state.lapLength)}
            frameFlangeWidth={state.frameFlangeWidth}
            loadDirection={loadDirection}
          />
        </div>
      </div>
    </Card>
  );
}

export default function ClientInput({state, dispatch, part, fixedLoadDirection, sectionCatalog = "purlin"}: ClientInputProps) {
  const intelliFrame = sectionCatalog === "intelliframe";
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
            {fixedLoadDirection ? (
              <div>
                <span id="load-direction-label" className="field-label">Load direction</span>
                <div className="field-locked" aria-labelledby="load-direction-label">
                  {fixedLoadDirection === "uplift" ? "Uplift" : "Gravity"}
                </div>
              </div>
            ) : (
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
            )}
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
              value={intelliFrame ? state.intelliFrameSection : state.crossSection}
              options={intelliFrame ? INTELLI_FRAME_OPTIONS : CROSS_SECTION_OPTIONS}
              onChange={(value) => dispatch({
                type: "set",
                field: intelliFrame ? "intelliFrameSection" : "crossSection",
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

type LoadDirection = "gravity" | "uplift";

type SectionCatalog = "purlin" | "intelliframe";

type ViewerCardProps = {
  state: PurLinLineState,
  loadDirection?: string,
  sectionCatalog?: SectionCatalog,
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
  part: "section" | "geometry",
  fixedLoadDirection?: LoadDirection,
  sectionCatalog?: SectionCatalog,
}

const LOAD_DIRECTION_OPTIONS = [
  { label: "Gravity", value: "gravity" },
  { label: "Uplift", value: "uplift" },
];


const CROSS_SECTION_OPTIONS = purlinData.map(item => {
  return {label: item.name, value: item.name}
});

const INTELLI_FRAME_OPTIONS = intelliFrameData.map(item => {
  return {label: item.name, value: item.name}
});

const DECK_OPTIONS = deckData.map(item => {
  return {label: item.name, value: item.name}
});
