import * as d3 from "d3";
import { processRawData, SAMPLE_RAW_DATA } from "@/components/results/results-display"


export default function DeflectionView() {

  const data = processRawData(SAMPLE_RAW_DATA)

  return (
    <>
      <LinePlot 
        dataX={data.nodeLocations}
        dataY={data.nodeDeflections}
        failureAt={data.failureNodeIndex}
      />
    </>
  );

}

function LinePlot({
  dataX,
  dataY,
  failureAt,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 20
}) {

  const data = []
  for (let index = 0; index < (dataX.length - 1); index++) {
    data.push({x: dataX[index], y: dataY[index]});
  }

  const xFailure = dataX[failureAt]
  const yFailure = dataY[failureAt]

  // dataAspect is needed to revert y value to the same scale as the x value
  const dataAspect = (d3.extent(dataX)[1] - d3.extent(dataX)[0]) / (d3.extent(dataY)[1] - d3.extent(dataY)[0]);
  const deformScale = 50

  const x = d3.scaleLinear(d3.extent(dataX), [marginLeft, width - marginRight]);
  const y = d3.scaleLinear([d3.extent(dataY)[0] * dataAspect / deformScale, d3.extent(dataY)[1] * dataAspect / deformScale], [height - marginBottom, marginTop]);
  const line = d3.line((d) => x(d.x), (d) => y(d.y));

  
  return (
    <svg width={width} height={height}>
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data)} />
      <g fill="white" stroke="currentColor" strokeWidth="1.5">
        {data.map((d, i) => (<circle key={d.x} cx={x(d.x)} cy={y(d.y)} r="2.5" />))}
      </g>
      <circle
        cx={x(xFailure)}
        cy={y(yFailure)}
        r="4.0"
        fill="#b91c1c"
      />
    </svg>
  );
}