import DeflectionView from "./deflection-view";

export default function ResultsDisplay({ data }: ResultsDisplayProps) {

  return (
    <div className="w-1/2 mt-12">
      <ReportCard title="Allowable gravity roof pressure">
        {`${data.capacity.value} ${data.capacity.unit}`}
      </ReportCard>
      <ReportCard title="Predicted failure limit state">
        {`${data.failureLimitState}`} 
      </ReportCard>
      <ReportCard title="Purlin deflection and failure location">
        <div>
          <DeflectionView data={data} scale={100}/>
        </div>
        
      </ReportCard>
    </div>
  );
}

function ReportCard({title, children}: React.ComponentProps<"div">) {
  return (
    <div className="collapse collapse-arrow bg-base-100 border borer-base-300">
        <input type="checkbox"/> 
        <div className="collapse-title text-lg font-medium">
          {title}
        </div>
        <div className="collapse-content">
          {children}
        </div>
      </div>
  );
}

export function processRawData(rawData: RawAPIData): AnalaysisData {
  return {
    capacity: {
      value: (rawData.applied_pressure * 1000 * 144).toPrecision(3),
      unit: "psf"
    },
    failureLimitState: rawData.failure_limit_state[0].toLocaleUpperCase() + rawData.failure_limit_state.slice(1),
    failureLocation: rawData.failure_location,
    nodeLocations: rawData.input_z,
    nodeDeflections: rawData.output_v, // downward being positive
    failureNodeIndex: findDeflectionAtFailureLocation(rawData)
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

type ResultsDisplayProps = {
  data: AnalaysisData
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
}


export type RawAPIData = {
  applied_pressure: number,
  failure_limit_state: string,
  failure_location: number,
  input_z: Array<number>,
  output_v: Array<number>
}

export const SAMPLE_RAW_DATA = {
  applied_pressure: 0.00008649904030109392,
  failure_limit_state: "biaxial bending",
  failure_location: 346.6666666666668,
  input_z: [
    0,
    8,
    16,
    24,
    32,
    40,
    48,
    56,
    64,
    72,
    80,
    88,
    96,
    104,
    112,
    120,
    128,
    136,
    144,
    152,
    160,
    168,
    176,
    184,
    192,
    200,
    208,
    216,
    224,
    232,
    240,
    250.66666666666666,
    261.3333333333333,
    272,
    282.6666666666667,
    293.33333333333337,
    304.00000000000006,
    314.66666666666674,
    325.3333333333334,
    336.0000000000001,
    346.6666666666668,
    357.3333333333335,
    368.00000000000017,
    378.66666666666686,
    389.33333333333354,
    400.0000000000002,
    410.6666666666669,
    421.3333333333336,
    432.0000000000003
  ],
  output_v: [
    0,
    0.03328154894289907,
    0.06538589470794216,
    0.09529583012005408,
    0.1221609708248136,
    0.14529055047233166,
    0.16414690884940256,
    0.17833980907823768,
    0.1876216830327917,
    0.19188387269666013,
    0.19115390836313073,
    0.18559384138237736,
    0.1754996286021206,
    0.16130154673803096,
    0.14356559667597021,
    0.122995839202733,
    0.10043758397256036,
    0.0768813317742879,
    0.05346734555438333,
    0.03149069742971252,
    0.012406606435341807,
    -0.002164155542993921,
    -0.01043005469615171,
    -0.010424096015576924,
    0,
    0.023170320210108165,
    0.0566236056405604,
    0.09807753549494802,
    0.1454273127270563,
    0.19674090450478643,
    0.250253339891674,
    0.32227412379765935,
    0.39199581134693956,
    0.45650435353387525,
    0.5133179237106559,
    0.5603621958845528,
    0.5959486937063644,
    0.6187568530994682,
    0.6278202852449086,
    0.6225176126934243,
    0.6025681691888145,
    0.5680327925007397,
    0.5193198880036307,
    0.4571968873183052,
    0.38280715892574263,
    0.2976923334660898,
    0.20381987191156156,
    0.10361551573859548,
    0
  ]
}
