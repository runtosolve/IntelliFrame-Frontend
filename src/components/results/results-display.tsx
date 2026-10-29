import type { ReactNode } from "react";
import { generatePurlinViewData } from "../viewer/purlin-view-utils";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { calculateSupportPositions } from "../viewer/purlin-view-utils";
import DeflectionView from "./deflection-view";
import { Card, Empty, Statistic } from "antd";
import {
  AimOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const BLANK = <span className="text-slate-300">—</span>;

export function DeflectionCard({ output, title }: ResultsDisplayProps & { title?: string }) {
  return (
    <Card
      title={
        <div className="card-title">
          <AreaChartOutlined aria-hidden />
          <div>
            <span>{title ?? "Purlin deflection and failure location"}</span>
            <small>Deflected shape with the governing failure point</small>
          </div>
        </div>
      }
      className="surface-card result-chart-card"
    >
      {output
        ? <DeflectionView data={output} scale={100} />
        : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Run an analysis to view the deflection profile"
          />
        )}
    </Card>
  );
}

export function ResultStats({ output, direction }: ResultsDisplayProps & { direction?: "gravity" | "uplift" }) {
  return (
    <div className="result-grid" aria-label="Analysis summary">
      <Card className="metric-card metric-primary">
        <div className="metric-heading">
          <span>{direction ? `Allowable ${direction} roof pressure` : "Allowable roof pressure"}</span>
          <DashboardOutlined aria-hidden />
        </div>
        {output ? (
          <Statistic
            value={output.capacity.value}
            suffix={output.capacity.unit}
            valueStyle={{ color: "#8e191d" }}
          />
        ) : BLANK}
        <p>Governing allowable pressure for the selected load direction.</p>
      </Card>

      <Card className="metric-card">
        <div className="metric-heading">
          <span>Predicted failure limit state</span>
          <SafetyCertificateOutlined aria-hidden />
        </div>
        {output
          ? <div className="metric-text">{output.failureLimitState}</div>
          : BLANK}
        <p>Predicted structural response controlling the analysis.</p>
      </Card>

      <Card className="metric-card">
        <div className="metric-heading">
          <span>Failure location</span>
          <AimOutlined aria-hidden />
        </div>
        {output ? (
          <div className="metric-text">
            {output.failureLocation.toLocaleString()} <small>in</small>
          </div>
        ) : BLANK}
        <p>Distance from the start of the modeled purlin line.</p>
      </Card>
    </div>
  );
}

export function PreviewResultRail({
  output,
  direction,
}: ResultsDisplayProps & { direction?: "gravity" | "uplift" }) {
  if (!output) return null;

  const pressureLabel = direction
    ? `Allowable ${direction} roof pressure`
    : "Allowable roof pressure";

  return (
    <aside className="preview-results-rail" aria-label="Analysis summary">
      <article className="preview-result-chip preview-result-chip--primary">
        <header>
          <span>{pressureLabel}</span>
          <DashboardOutlined aria-hidden />
        </header>
        <div className="preview-result-value preview-result-value--accent">
          {output.capacity.value}
          <small>{output.capacity.unit}</small>
        </div>
        <p>Governing allowable pressure for this load direction.</p>
      </article>

      <article className="preview-result-chip">
        <header>
          <span>Predicted failure limit state</span>
          <SafetyCertificateOutlined aria-hidden />
        </header>
        <div className="preview-result-value preview-result-value--wrap">
          {output.failureLimitState}
        </div>
        <p>Controlling structural response from the analysis.</p>
      </article>

      <article className="preview-result-chip">
        <header>
          <span>Failure location</span>
          <AimOutlined aria-hidden />
        </header>
        <div className="preview-result-value">
          {output.failureLocation.toLocaleString()}
          <small>in</small>
        </div>
        <p>Distance from the start of the modeled purlin line.</p>
      </article>
    </aside>
  );
}

export function processRawData(inputData: PurLinLineState, rawData: RawAPIData): AnalaysisData {
  return {
    capacity: {
      value: (rawData.applied_pressure * 1000 * 144).toPrecision(3), // convert from ksi to psf
      unit: "psf"
    },
    failureLimitState: rawData.failure_limit_state[0].toLocaleUpperCase() + rawData.failure_limit_state.slice(1),
    failureLocation: rawData.failure_location,
    nodeLocations: rawData.input_z,
    nodeDeflections: rawData.output_v, // downward being positive
    failureNodeIndex: findDeflectionAtFailureLocation(rawData),
    supportLocations: findSupportLocations(inputData),
  }
}

export function describeFailureLocation(zInches: number, supportsInches: number[]): string {
  if (supportsInches.length === 0) return `${(zInches / 12).toFixed(1)} ft from start`;

  for (let k = 0; k < supportsInches.length; k++) {
    if (Math.abs(zInches - supportsInches[k]) <= 1.0) {
      const n = k + 1;
      return k === 0 || k === supportsInches.length - 1
        ? `At end support ${n}`
        : `At interior support ${n}`;
    }
  }

  let spanIndex = 0;
  for (let i = 0; i < supportsInches.length; i++) {
    if (supportsInches[i] < zInches) spanIndex = i;
  }
  const distFt = (zInches - supportsInches[spanIndex]) / 12;
  return `In span ${spanIndex + 1}, ${distFt.toFixed(1)} ft from support ${spanIndex + 1}`;
}

export function maxDeflectionSummary(output: AnalaysisData): { inches: number; ratioLabel: string } | null {
  const { nodeLocations, nodeDeflections, supportLocations } = output;
  if (!nodeDeflections.length || !nodeLocations.length) return null;

  let iv = 0;
  let maxAbs = 0;
  for (let i = 0; i < nodeDeflections.length; i++) {
    const abs = Math.abs(nodeDeflections[i]);
    if (abs > maxAbs) {
      maxAbs = abs;
      iv = i;
    }
  }
  if (maxAbs < 1e-9) return { inches: 0, ratioLabel: "—" };

  const z = nodeLocations[iv];
  let spanIndex = 0;
  for (let i = 0; i < supportLocations.length - 1; i++) {
    if (supportLocations[i] <= z) spanIndex = i;
  }
  const L = supportLocations.length > 1
    ? supportLocations[spanIndex + 1] - supportLocations[spanIndex]
    : Math.max(...nodeLocations) - Math.min(...nodeLocations);
  const ratio = L / maxAbs;

  return {
    inches: maxAbs,
    ratioLabel: `L/${Math.round(ratio)}`,
  };
}

function pressurePsf(output: AnalaysisData | null): number | null {
  if (!output) return null;
  const n = Number(output.capacity.value);
  return Number.isFinite(n) ? Math.abs(n) : null;
}

function improvementPercent(existing: AnalaysisData | null, retrofit: AnalaysisData | null): string {
  const a = pressurePsf(existing);
  const b = pressurePsf(retrofit);
  if (a == null || b == null || a < 1e-9) return "—";
  const pct = ((b - a) / a) * 100;
  const rounded = Math.round(pct);
  return `${rounded >= 0 ? "+" : ""}${rounded} %`;
}

function cellOrDash(content: ReactNode, empty: boolean) {
  return empty ? <span className="summary-blank">—</span> : content;
}

type SummaryRuns = {
  "existing-gravity": AnalaysisData | null,
  "existing-uplift": AnalaysisData | null,
  "retrofit-gravity": AnalaysisData | null,
  "retrofit-uplift": AnalaysisData | null,
};

export function SummaryComparisonTable({
  runs,
  staleKeys = [],
}: {
  runs: SummaryRuns,
  staleKeys?: string[],
}) {
  const eg = runs["existing-gravity"];
  const ug = runs["existing-uplift"];
  const rg = runs["retrofit-gravity"];
  const ru = runs["retrofit-uplift"];

  const pressureCell = (output: AnalaysisData | null) => {
    const p = pressurePsf(output);
    return cellOrDash(
      p == null ? null : (
        <span className="summary-pressure">
          {p.toPrecision(3)}
          <small>psf</small>
        </span>
      ),
      p == null,
    );
  };

  const limitCell = (output: AnalaysisData | null) =>
    cellOrDash(output ? <span className="summary-limit-text">{output.failureLimitState}</span> : null, !output);

  const locationCell = (output: AnalaysisData | null) =>
    cellOrDash(
      output
        ? <span className="summary-location-text">{describeFailureLocation(output.failureLocation, output.supportLocations)}</span>
        : null,
      !output,
    );

  const deflectionCell = (output: AnalaysisData | null) => {
    if (!output) return cellOrDash(null, true);
    const info = maxDeflectionSummary(output);
    if (!info) return cellOrDash(null, true);
    return (
      <span className="summary-deflection">
        {info.inches.toFixed(2)} in.
        <small>({info.ratioLabel})</small>
      </span>
    );
  };

  const staleNote = staleKeys.length > 0;

  return (
    <div className="summary-table-card">
      <table className="summary-compare-table" aria-labelledby="summary-title">
        <thead>
          <tr>
            <th scope="col" className="summary-row-label" rowSpan={2}> </th>
            <th scope="colgroup" colSpan={2}>Gravity</th>
            <th scope="colgroup" colSpan={2}>Uplift</th>
          </tr>
          <tr>
            <th scope="col">Existing</th>
            <th scope="col">IRF retrofit</th>
            <th scope="col">Existing</th>
            <th scope="col">IRF retrofit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Allowable pressure</th>
            <td>{pressureCell(eg)}</td>
            <td>{pressureCell(rg)}</td>
            <td>{pressureCell(ug)}</td>
            <td>{pressureCell(ru)}</td>
          </tr>
          <tr className="summary-improve-row">
            <th scope="row">Improvement</th>
            <td colSpan={2} className="summary-improve">{improvementPercent(eg, rg)}</td>
            <td colSpan={2} className="summary-improve">{improvementPercent(ug, ru)}</td>
          </tr>
          <tr>
            <th scope="row">Governing limit state</th>
            <td>{limitCell(eg)}</td>
            <td>{limitCell(rg)}</td>
            <td>{limitCell(ug)}</td>
            <td>{limitCell(ru)}</td>
          </tr>
          <tr>
            <th scope="row">Failure location</th>
            <td>{locationCell(eg)}</td>
            <td>{locationCell(rg)}</td>
            <td>{locationCell(ug)}</td>
            <td>{locationCell(ru)}</td>
          </tr>
          <tr>
            <th scope="row">Max. deflection</th>
            <td>{deflectionCell(eg)}</td>
            <td>{deflectionCell(rg)}</td>
            <td>{deflectionCell(ug)}</td>
            <td>{deflectionCell(ru)}</td>
          </tr>
        </tbody>
      </table>
      {staleNote && (
        <p className="summary-stale-footnote">
          Some cases are out of date with the current inputs — re-run those analyses before issuing results.
        </p>
      )}
    </div>
  );
}

export function findDeflectionAtFailureLocation(rawData: RawAPIData) {
  const TOL = 1E-6
  for (let index = 0; index < rawData.input_z.length; index++) {
    if (Math.abs(rawData.input_z[index] - rawData.failure_location) <= TOL) {
      return index
    }
  }
  return null
}

function findSupportLocations(inputData: PurLinLineState) {
  const purlinData = generatePurlinViewData(inputData.spans, inputData.lapNegZ, inputData.lapPosZ);

  const supportLocations = calculateSupportPositions(purlinData, 0, 0).map(item => item.x * 12);

  return supportLocations;
}


type ResultsDisplayProps = {
  output: AnalaysisData | null
}

export type AnalaysisData = {
  capacity: {
    value: string,
    unit: string,
  }
  failureLimitState: string,
  failureLocation: number,
  nodeLocations: Array<number>,
  nodeDeflections: Array<number>,
  failureNodeIndex: number | null, 
  supportLocations: Array<number>,
}


export type RawAPIData = {
  applied_pressure: number,
  failure_limit_state: string,
  failure_location: number,
  input_z: Array<number>,
  output_v: Array<number>
}
