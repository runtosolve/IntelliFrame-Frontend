import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch } from "./hooks/use-purlin-line";
import { Card, Tag } from "antd";
import dynamic from "next/dynamic";
import { useMemo } from "react";
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
  const purlinViewData = useMemo(
    () => generatePurlinViewData(state.spans, state.lapLength),
    [state.spans, state.lapLength],
  );
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
            existingName={sectionCatalog === "intelliframe" ? state.crossSection : undefined}
            catalog={sectionCatalog}
            rotation={-state.roofSlope}
            loadDirection={loadDirection}
          />
        </div>
        <div className="preview-layout">
          <div className="preview-label">Framing layout</div>
          <PurlineViewNoSSR
            purlinData={purlinViewData}
            frameFlangeWidth={state.frameFlangeWidth}
            loadDirection={loadDirection}
          />
        </div>
      </div>
    </Card>
  );
}

function LockedField({ label, unit, name, value }: { label: string, unit?: string, name: string, value: string }) {
  return (
    <div>
      <span id={`${name}-label`} className="field-label">
        <span>{label}</span>
        {unit && <span className="field-unit">{unit}</span>}
      </span>
      <div className="field-locked" aria-labelledby={`${name}-label`} aria-readonly="true">
        {value}
      </div>
    </div>
  );
}

function LockedSpans({ spans }: { spans: PurLinLineState["spans"] }) {
  return (
    <div>
      <span id="spans-label" className="field-label">
        <span>Spans</span>
        <span className="field-unit">ft</span>
      </span>
      <div className="space-y-2.5" role="list" aria-labelledby="spans-label">
        {spans.map((span, index) => (
          <div key={span.id} className="flex items-center gap-2" role="listitem">
            <span className="span-index" aria-hidden>{index + 1}</span>
            <div className="field-locked flex-1" aria-label={`Span ${index + 1}`} aria-readonly="true">
              {formatNumber(span.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? String(Number(value.toFixed(4))) : "—";
}

export default function ClientInput({state, dispatch, part, fixedLoadDirection, sectionCatalog = "purlin", readOnly = false}: ClientInputProps) {
  const intelliFrame = sectionCatalog === "intelliframe";
  const sectionValue = intelliFrame ? state.intelliFrameSection : state.crossSection;

  if (readOnly) {
    return (
      <Card
        title={
          <div className="card-title">
            {part === "section" ? <CompassOutlined aria-hidden /> : <ApartmentOutlined aria-hidden />}
            <div>
              <span>{part === "section" ? "Section" : "Geometry"}</span>
              <small>Same as Gravity Build · read only</small>
            </div>
          </div>
        }
        className="surface-card input-card"
      >
        <div className="input-section">
          <div className="form-stack">
            {part === "section" ? (
              <>
                <LockedField
                  label="Load direction"
                  name="loadDirection"
                  value={fixedLoadDirection === "uplift" ? "Uplift" : "Gravity"}
                />
                <LockedField label="Roof slope" unit="deg" name="roofSlope" value={formatNumber(state.roofSlope)} />
                <LockedField label="Cross section" name="crossSection" value={sectionValue} />
                <LockedField label="Deck type" name="deckType" value={state.deckType} />
              </>
            ) : (
              <>
                <LockedSpans spans={state.spans} />
                <LockedField label="Lap length" unit="ft" name="lapLength" value={formatNumber(state.lapLength)} />
                <LockedField label="Spacing" unit="ft" name="spacing" value={formatNumber(state.spacing)} />
                <LockedField
                  label="Frame flange width"
                  unit="in"
                  name="frameFlangeWidth"
                  value={formatNumber(state.frameFlangeWidth)}
                />
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

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
                  payload: value === "uplift" ? "uplift" : "gravity"
                })}
              />
            )}
            <LabelledInputField
              label="Roof slope"
              unit="deg"
              name="roofSlope"
              defaultValue={formatNumber(state.roofSlope)}
              setField={(v) => dispatch({
                type: "set",
                field: "roofSlope",
                payload: v
              })}
            />
            <LabelledSelectField
              label="Cross section"
              name="crossSection"
              value={sectionValue}
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
            defaultValue={formatNumber(state.lapLength)}
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
            defaultValue={formatNumber(state.spacing)}
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
            defaultValue={formatNumber(state.frameFlangeWidth)}
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
  loadDirection?: LoadDirection,
  sectionCatalog?: SectionCatalog,
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
  part: "section" | "geometry",
  fixedLoadDirection?: LoadDirection,
  sectionCatalog?: SectionCatalog,
  readOnly?: boolean,
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
