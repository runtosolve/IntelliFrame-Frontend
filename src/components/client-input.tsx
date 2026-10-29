import DynamicInputFiled from "./form-input/dynamic-input-field";
import LabelledInputField, { InputField } from "./form-input/input-field";
import LabelledSelectField from "./form-input/select-field";
import { PurLinLineState, PurLinLineStateDispatch } from "./hooks/use-purlin-line";
import { Card, Tag } from "antd";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import purlinData from "../data/Purlins.json";
import intelliFrameData from "../data/IntelliFrameRF.json";
import deckData from "../data/Decks.json";
import { generatePurlinViewData } from "./viewer/purlin-view-utils";
import { PreviewResultRail, type AnalaysisData } from "./results/results-display";
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


export function ViewerCard({
  state,
  loadDirection = state.loadDirection,
  sectionCatalog = "purlin",
  showLoad = true,
  deflection = null,
}: ViewerCardProps) {
  const sectionName = sectionCatalog === "intelliframe" ? state.intelliFrameSection : state.crossSection;
  const purlinViewData = useMemo(
    () => generatePurlinViewData(state.spans, state.lapNegZ, state.lapPosZ),
    [state.spans, state.lapNegZ, state.lapPosZ],
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
      <div className={`preview-canvas${showLoad ? " preview-canvas--analysis" : ""}${deflection ? " preview-canvas--has-results" : ""}`}>
        <div className="preview-section">
          <div className="preview-label">Cross section</div>
          <SectionViewNoSSR
            purlinName={sectionName}
            existingName={sectionCatalog === "intelliframe" ? state.crossSection : undefined}
            catalog={sectionCatalog}
            rotation={-state.roofSlope}
            loadDirection={showLoad ? loadDirection : undefined}
          />
          {deflection ? (
            <PreviewResultRail output={deflection} direction={loadDirection} />
          ) : null}
        </div>
        <div className="preview-layout">
          <div className="preview-label">Framing layout</div>
          {showLoad ? (
            <div className="framing-axes" aria-hidden>
              <svg viewBox="0 0 56 56" width="56" height="56">
                <defs>
                  <marker id="framing-axis-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#44403c" />
                  </marker>
                </defs>
                <line x1="18" y1="38" x2="44" y2="38" stroke="#44403c" strokeWidth="1.6" markerEnd="url(#framing-axis-arrow)" />
                <text x="46" y="42" fill="#44403c" fontSize="12" fontWeight="700">Z</text>
                <line x1="18" y1="38" x2="18" y2="12" stroke="#44403c" strokeWidth="1.6" markerEnd="url(#framing-axis-arrow)" />
                <text x="14" y="10" fill="#44403c" fontSize="12" fontWeight="700" textAnchor="middle">Y</text>
              </svg>
            </div>
          ) : null}
          <PurlineViewNoSSR
            purlinData={purlinViewData}
            frameFlangeWidth={state.frameFlangeWidth}
            loadDirection={showLoad ? loadDirection : undefined}
            deflection={deflection}
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
      </span>
      <div className="field-locked" aria-labelledby={`${name}-label`} aria-readonly="true">
        <span>{value}</span>
        {unit && <span className="field-inline-unit">{unit}</span>}
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

export default function ClientInput({state, dispatch, part, retrofit = false}: ClientInputProps) {
  if (retrofit) {
    return (
      <Card
        title={
          <div className="card-title">
            {part === "section" ? <CompassOutlined aria-hidden /> : <ApartmentOutlined aria-hidden />}
            <div>
              <span>{part === "section" ? "Section" : "Geometry"}</span>
              <small>
                {part === "section"
                  ? "Same as Build Existing Roof · choose the IntelliFrame RF profile"
                  : "Same as Build Existing Roof · read only"}
              </small>
            </div>
          </div>
        }
        className="surface-card input-card"
      >
        <div className="input-section">
          <div className="form-stack">
            {part === "section" ? (
              <>
                <div>
                  <span id="roofSlope-label" className="field-label">
                    <span>Roof slope</span>
                  </span>
                  <div className="roof-slope-row" aria-labelledby="roofSlope-label">
                    <div className="field-locked roof-slope-input" aria-readonly="true">
                      {formatNumber(state.roofSlope)}
                    </div>
                    <span className="roof-slope-suffix">on 12</span>
                  </div>
                </div>
                <LockedField label="Cross section" name="crossSection" value={state.crossSection} />
                <LockedField label="Roof deck type" name="deckType" value={state.deckType} />
                <LabelledSelectField
                  label="IntelliFrame RF Profile"
                  name="intelliFrameSection"
                  value={state.intelliFrameSection}
                  options={INTELLI_FRAME_OPTIONS}
                  emphasized
                  onChange={(value) => dispatch({
                    type: "set",
                    field: "intelliFrameSection",
                    payload: value
                  })}
                />
              </>
            ) : (
              <>
                <LockedSpans spans={state.spans} />
                <div>
                  <span id="purlinLapLength-label" className="field-label">
                    <span>Purlin lap length</span>
                  </span>
                  <div className="lap-length-row" aria-labelledby="purlinLapLength-label">
                    <div className="lap-length-field">
                      <div className="lap-length-field-row">
                        <span className="lap-length-tag" aria-hidden>-Z</span>
                        <div className="field-locked" aria-label="Purlin lap length -Z" aria-readonly="true">
                          <span>{formatNumber(state.lapNegZ)}</span>
                          <span className="field-inline-unit">ft</span>
                        </div>
                      </div>
                    </div>
                    <div className="lap-length-field">
                      <div className="lap-length-field-row">
                        <span className="lap-length-tag" aria-hidden>+Z</span>
                        <div className="field-locked" aria-label="Purlin lap length +Z" aria-readonly="true">
                          <span>{formatNumber(state.lapPosZ)}</span>
                          <span className="field-inline-unit">ft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <LockedField label="Purlin spacing" unit="ft" name="spacing" value={formatNumber(state.spacing)} />
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
                ? "Roof slope, cross section, and deck"
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
            <div>
              <label htmlFor="roofSlope" className="field-label">
                <span>Roof slope</span>
              </label>
              <div className="roof-slope-row">
                <InputField
                  className="roof-slope-input"
                  name="roofSlope"
                  defaultValue={formatNumber(state.roofSlope)}
                  setField={(v) => dispatch({
                    type: "set",
                    field: "roofSlope",
                    payload: v
                  })}
                />
                <span className="roof-slope-suffix" aria-hidden="false">on 12</span>
              </div>
            </div>
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
              label="Roof deck type"
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
          <div>
            <span id="purlinLapLength-label" className="field-label">
              <span>Purlin lap length</span>
            </span>
            <div className="lap-length-row" aria-labelledby="purlinLapLength-label">
              <div className="lap-length-field">
                <div className="lap-length-field-row">
                  <label htmlFor="lapNegZ" className="lap-length-tag">-Z</label>
                  <InputField
                    name="lapNegZ"
                    unit="ft"
                    defaultValue={formatNumber(state.lapNegZ)}
                    minValue={0.5}
                    setField={(v) => dispatch({
                      type: "set",
                      field: "lapNegZ",
                      payload: v,
                    })}
                  />
                </div>
              </div>
              <div className="lap-length-field">
                <div className="lap-length-field-row">
                  <label htmlFor="lapPosZ" className="lap-length-tag">+Z</label>
                  <InputField
                    name="lapPosZ"
                    unit="ft"
                    defaultValue={formatNumber(state.lapPosZ)}
                    minValue={0.5}
                    setField={(v) => dispatch({
                      type: "set",
                      field: "lapPosZ",
                      payload: v,
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <LabelledInputField
            label="Purlin spacing"
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
  showLoad?: boolean,
  deflection?: AnalaysisData | null,
}

type ClientInputProps = {
  state: PurLinLineState,
  dispatch: PurLinLineStateDispatch,
  part: "section" | "geometry",
  retrofit?: boolean,
}

const CROSS_SECTION_OPTIONS = purlinData.map(item => {
  return {label: item.name, value: item.name}
});

const INTELLI_FRAME_OPTIONS = intelliFrameData.map(item => {
  return {label: item.name, value: item.name}
});

const DECK_OPTIONS = deckData.map(item => {
  return {label: item.name, value: item.name}
});
