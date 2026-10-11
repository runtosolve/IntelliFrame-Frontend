import { extent, line, max, min, scaleLinear, symbol, symbolTriangle } from "d3";
import { useEffect, useMemo, useRef, useState } from 'react'

const SUPPORT_SYMBOL_PATH = symbol().type(symbolTriangle).size(100)();

export default function DeflectionView({data, scale = 50, ...props}) {

  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({width: 100, height: 100});

  const handleResize = () => {
    const rect = containerRef.current.getBoundingClientRect();
    setContainerSize({width: rect.width, height: rect.height});
  }

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return (() => {
      window.removeEventListener("resize", handleResize);
    })
  }, []);


  return (
    <div ref={containerRef} {...props}>
      <LinePlot
        width={containerSize.width}
        height={containerSize.height}
        dataX={data.nodeLocations}
        dataY={data.nodeDeflections}
        failureAt={data.failureNodeIndex}
        supportLocations={data.supportLocations}
        deformScale={scale}
      />
    </div>
  );

}

function LinePlot({
  dataX,
  dataY,
  failureAt,
  supportLocations,
  width = 500,
  height = 250,
  margin = 20,
  deformScale = 100,
}) {

  const TOOLTIP_OFFSET = 20; 

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const toolTipRef = useRef(null);
  const [currentNodeIndex, setCurNodeIndex] = useState(null);

  const data = useMemo(
    () => dataX.map((x, index) => ({ x, y: dataY[index] })),
    [dataX, dataY],
  );

  const xFailure = dataX[failureAt];
  const yFailure = dataY[failureAt];

  const { mapX, mapY } = useMemo(() => {
    const L = max(dataX) - min(dataX);
    return {
      mapX: scaleLinear(extent(dataX), [margin, width - margin]),
      mapY: scaleLinear([-L / 2 / deformScale, L / 2 / deformScale], [margin, height - margin]),
    };
  }, [dataX, width, height, margin, deformScale]);

  const linePath = useMemo(
    () => line((d) => mapX(d.x), (d) => mapY(d.y))(data),
    [data, mapX, mapY],
  );
  const maxDeflection = useMemo(() => max(dataY), [dataY]);

  const handleMouseOverFor = (index) => {
    return ((e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      let toolTipX = 0;
      let toolTipY = 0;
      const toolTipWidth = toolTipRef.current.getBoundingClientRect().width;
      const toolTipHeight = toolTipRef.current.getBoundingClientRect().height;
      if (mouseX < rect.width / 2) {
        toolTipX = mapX(dataX[index]) + TOOLTIP_OFFSET;
      }
      else {
        toolTipX = mapX(dataX[index]) - toolTipWidth - TOOLTIP_OFFSET;
      }
      toolTipRef.current.style.left = `${(toolTipX).toFixed(0)}px`;
      if (mouseY < rect.height / 2) {
        toolTipY = mapY(dataY[index]) + TOOLTIP_OFFSET;
      }
      else {
        toolTipY = mapY(dataY[index]) - toolTipHeight - TOOLTIP_OFFSET;
      }
      toolTipRef.current.style.top = `${(toolTipY).toFixed(0)}px`;

      setCurNodeIndex(index);
      
      
    });
  };

  const handleMouseOut = () => {
    setCurNodeIndex(null);
  };

  return (
    <div className="relative w-full aspect-[3/1]" ref={containerRef}>
      <svg className="w-full h-full" ref={svgRef}>
        <path fill="none" stroke="currentColor" strokeWidth={2} d={linePath} />
        <circle
          cx={mapX(xFailure)}
          cy={mapY(yFailure)}
          r={10}
          fill="#b91c1c"
          className="animate-pulse"
        />
        <g stroke="currentColor" strokeWidth="1.5">
          {data.map((d, i) => (
            <circle 
              key={d.x} cx={mapX(d.x)} cy={mapY(d.y)} r={5} 
              onMouseOver={handleMouseOverFor(i)}
              onMouseOut={handleMouseOut}
              className={(currentNodeIndex != i) ? "opacity-0" : "opacity-100"}
            />
          ))}
        </g>
        <g>
          {supportLocations.map((x) => (
            <path
            key={x}
            d={SUPPORT_SYMBOL_PATH}
            fill="currentColor"
            transform={`translate(${mapX(x)}, ${mapY(0.4)})`}
          />
          ))}
        </g>
      </svg>
      <div 
        className={`absolute ${!currentNodeIndex && "opacity-0"} rounded border border-gray-950 bg-gray-100 bg-opacity-30 px-2 py-1 text-sm`}
        ref={toolTipRef}
      >
        <ul>
          <li>
            <span className="font-semibold">deflection: </span>{currentNodeIndex ? dataY[currentNodeIndex].toPrecision(2) : (0.10)} in.
          </li>
          <li>
            <span className="font-semibold">max deflection: </span>{maxDeflection.toPrecision(2)} in.
          </li>
        </ul>
      </div>
    </div>
  );
}