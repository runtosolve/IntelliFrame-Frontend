import { useRef, useState } from "react";
import { Layer, Rect, RegularPolygon, Stage } from "react-konva";
import Konva from "konva"
import { useResponsiveStage } from "./hooks/use-responsive-stage";


export default function PurlinView({ data }: PurLinViewProps) {

  const box = getBoundingBox(data);

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  // Make stage responsive to container size
  // And make stage repsonsive to content by centering purlin spans
  useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom})

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-300 ">
      <Stage ref={stageRef}>
        <Layer>
          {generatePurlins(data, zoom)}
          {generateSupports(data, zoom)}
        </Layer>
      </Stage>
    </div>
  )
}

const PURLIN_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const SUPPORT_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const LAP_OFFSET_Y = 0.2;
const PURLIN_HEIGHT = 8 / 12;
const SUPPORT_RAIDUS = 8 / 12;

function getBoundingBox(data: Array<PurlinData>) {
  let width = 0;
  data.forEach(item => {
    width += item.span - item.rightLap;
  })
  
  const box = {
    x: width / 2,
    y: 0,
    width: width,
    height: PURLIN_HEIGHT,
  }

  return box;
}

const generatePurlins = (data: Array<PurlinData>, zoom: number) => {
  let prevx = 0
  let prevy = LAP_OFFSET_Y / 2;

  return (
    data.map((item) => {
    const curx = prevx
    const cury = prevy

    prevx += item.span - item.rightLap;
    prevy = (prevy < 0) ? (LAP_OFFSET_Y / 2) : (-LAP_OFFSET_Y / 2);

    return (
      <Rect
        key={item.id}
        x={curx}
        y={cury}
        width={item.span}
        height={PURLIN_HEIGHT}
        strokeWidth={1.25 / zoom}
        {...PURLIN_STYLE}
      />
    );
  }))
};

const generateSupports = (data: Array<PurlinData>, zoom: number) => {

  const locations: Array<number> = []
  let curPos = 0;
  data.forEach((item, index) => {
    if (index == 0) locations.push(curPos);
    curPos += item.span - item.rightLap / 2 - item.leftLap / 2;
    locations.push(curPos);
  })

  return (
    locations.map((x) => (
      <RegularPolygon
        key={x}
        x={x}
        y={PURLIN_HEIGHT + 1.5 * SUPPORT_RAIDUS + LAP_OFFSET_Y / 2}
        sides={3} 
        radius={1}
        strokeWidth={1 / zoom}
        {...SUPPORT_STYLE}
        />
    ))
  );
}

type PurLinViewProps = {
  data: Array<PurlinData>
}

type PurlinData = {
  id: string,
  index: number,
  leftLap: number,
  span: number,
  rightLap: number,
}