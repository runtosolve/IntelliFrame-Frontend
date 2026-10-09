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
            valueStyle={{ color: "#132f4c" }}
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

export const SAMPLE_RAW_DATA = {
  applied_pressure: 0.00008666681749903812,
  failure_limit_state: "biaxial bending",
  failure_location: 348,
  input_z: [
    0,
    9.333333333333334,
    18.666666666666668,
    28,
    37.333333333333336,
    46.66666666666667,
    56.00000000000001,
    65.33333333333334,
    74.66666666666667,
    84,
    93.33333333333333,
    102.66666666666666,
    111.99999999999999,
    121.33333333333331,
    130.66666666666666,
    140,
    149.33333333333334,
    158.66666666666669,
    168.00000000000003,
    172.00000000000003,
    176.00000000000003,
    180.00000000000003,
    184.00000000000003,
    188.00000000000003,
    192.00000000000003,
    196.00000000000003,
    200.00000000000003,
    204.00000000000003,
    208.00000000000003,
    212.00000000000003,
    216.00000000000003,
    228.00000000000003,
    240.00000000000003,
    252.00000000000003,
    264,
    276,
    288,
    300,
    312,
    324,
    336,
    348,
    360,
    372,
    384,
    396,
    408,
    420,
    432
  ],
  output_v: [
    0,
    0.03868291521313474,
    0.07552132025928499,
    0.10896548610717798,
    0.1377708223878119,
    0.1609828947902607,
    0.17792437453044568,
    0.18818425590716448,
    0.19160956372661428,
    0.1882996775280203,
    0.1786033195364907,
    0.16311818346903453,
    0.14269311710959057,
    0.11843270843191854,
    0.09170405862867329,
    0.06414545156182709,
    0.037676544029607545,
    0.01450960136967633,
    -0.0028388146886163088,
    -0.007801971248679051,
    -0.010938620153697422,
    -0.01199620537222327,
    -0.01071093724208061,
    -0.006807702743988844,
    0,
    0.010010099034347686,
    0.02290765030983601,
    0.03838910881264018,
    0.056162263955395655,
    0.07594614643477537,
    0.0974709103549994,
    0.169956796976717,
    0.24944406972286795,
    0.3303702507938272,
    0.4079557892644408,
    0.4781535777620033,
    0.5376009496330505,
    0.5835766140508657,
    0.6139643289470135,
    0.6272246244137905,
    0.6223755412967099,
    0.5989831075352227,
    0.5571621034448284,
    0.49758753043671405,
    0.4215170580894144,
    0.3308245425107435,
    0.22804444257656145,
    0.11642656525901737,
    0
  ]
}
