import * as d3 from "d3";
import { processRawData, SAMPLE_RAW_DATA } from "@/components/results/results-display"
import { useRef, useState } from 'react'

export default function DeflectionView() {

  const data = processRawData(SAMPLE_RAW_DATA)

  return (
    <>
      <LinePlot
        width={500}
        height={400}
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
  margin = 20,
  deformScale = 50,
}) {

  const TOOLTIP_OFFSET = 20; 

  const toolTipRef = useRef(null);
  const [currentNodeIndex, setCurNodeIndex] = useState(null);

  const data = []
  for (let index = 0; index < (dataX.length - 1); index++) {
    data.push({x: dataX[index], y: dataY[index]});
  }

  const xFailure = dataX[failureAt];
  const yFailure = dataY[failureAt];

  const L = (d3.max(dataX) - d3.min(dataX));
  const x = d3.scaleLinear(d3.extent(dataX), [margin, width - margin]);
  const y = d3.scaleLinear([-L / 2 / deformScale, L / 2 / deformScale], [margin, height - margin]);
  const line = d3.line((d) => x(d.x), (d) => y(d.y));

  const handleMouseOverFor = (index) => {
    return (() => {
      setCurNodeIndex(index);
      toolTipRef.current.style.left = `${(x(dataX[index]) + TOOLTIP_OFFSET).toFixed(0)}px`;
      toolTipRef.current.style.top = `${(y(dataY[index]) + TOOLTIP_OFFSET).toFixed(0)}px`;
    });
  };

  const handleMouseOut = () => {
    setCurNodeIndex(null);
  };
  
  return (
    <div className="relative w-fit h-fit">
      <svg width={width} height={height}>
        <path fill="none" stroke="currentColor" strokeWidth={2} d={line(data)} />
        <circle
          cx={x(xFailure)}
          cy={y(yFailure)}
          r={10}
          fill="#b91c1c"
          className="animate-pulse"
        />
        <g stroke="currentColor" strokeWidth="1.5">
          {data.map((d, i) => (
            <circle 
              key={d.x} cx={x(d.x)} cy={y(d.y)} r={5} 
              onMouseOver={handleMouseOverFor(i)}
              onMouseOut={handleMouseOut}
              className={(currentNodeIndex != i) ? "opacity-0" : "opacity-100"}
            />
          ))}
        </g>
      </svg>
      <div 
        className={`absolute ${!currentNodeIndex && "hidden"} w-fit rounded border border-gray-950 bg-gray-100 bg-opacity-30 px-2 py-1 text-sm`}
        ref={toolTipRef}
      >
        {currentNodeIndex && 
          <ul>
            <li>
              <span className="font-semibold">deflection: </span>{dataY[currentNodeIndex].toFixed(2)} in.
            </li>
            <li>
              <span className="font-semibold">max deflection: </span>{d3.max(dataY).toFixed(2)} in.
            </li>
          </ul>
        }
      </div>
    </div>
  );
}