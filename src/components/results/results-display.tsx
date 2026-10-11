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

export function findDeflectionAtFailureLocation(rawData: RawAPIData) {
  const TOL = 1E-6
  for (let index = 0; index < (rawData.input_z.length - 1); index++) {
    if (Math.abs(rawData.input_z[index] - rawData.failure_location) <= TOL) {
      return index
    }
  }
  return null
}

function findSupportLocations(inputData: PurLinLineState) {
  const purlinData = generatePurlinViewData(inputData.spans, inputData.lapLength);

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
