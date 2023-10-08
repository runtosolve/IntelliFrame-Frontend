import { useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import Konva from "konva"
import { useResponsiveStage } from "./hooks/use-responsive-stage";



export default function PurlinView({ data }: PurLinViewProps) {

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  // Make stage responsive to container size
  // And make stage repsonsive to content by centering purlin spans
  useResponsiveStage({ stageRef, containerRef, targetZoom: zoom })

  // Use imperative way to add rectangles because they need to sync with stage positions and have logic for position
  // Could be refactored into declaritive code
  useEffect(() => {
    const layer = new Konva.Layer()
    stageRef.current.add(layer)

    const { shapes: purlins, group } = createPurlins(data, zoom);
    const supports = createSupports(data, zoom);
    layer.add(...purlins);
    layer.add(...supports);
    layer.x(stageRef.current.width() / 2 - group.x)
    layer.y(stageRef.current.height() / 2 - group.y)

    // Update zoom
    setZoom(Math.min(0.8 * containerRef.current.offsetWidth / group.width, 0.8 * containerRef.current.offsetHeight / group.height));

    return (() => {
      // Clean up to prevent memory leak
      for (const s of purlins) {
        s.destroy()
      }
      layer.destroy()
    })

  }, [data, zoom])


  return (
    <div ref={containerRef} className="w-full aspect-video rounded overflow-hidden mb-8 bg-gray-300 ">
      <Stage ref={stageRef}>
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

function createPurlins(data: Array<PurlinData>, zoom: number) {
  const shapes: Array<Konva.Shape> = []

  let xPos = 0
  let yPos = LAP_OFFSET_Y / 2

  for (const item of data) {
    let cur = new Konva.Rect({
      width: item.span,
      height: PURLIN_HEIGHT,
      x: xPos,
      y: yPos,
      strokeWidth: 1.25 / zoom,
      ...PURLIN_STYLE
    })
    shapes.push(cur)
    xPos += item.span - item.rightLap
    yPos = (yPos < 0) ? (LAP_OFFSET_Y / 2) : (-LAP_OFFSET_Y / 2)
  }

  const group = {
    x: xPos / 2,
    y: 0,
    width: xPos,
    height: LAP_OFFSET_Y,
  }

  return { shapes, group }
}

function createSupports(data: Array<PurlinData>, zoom: number) {
  const shapes: Array<Konva.Shape> = [];
  let curPos = 0;
  data.forEach((item, index) => {
    if (index ==  0) { // only add left support if it is the first span
      let left = new Konva.RegularPolygon({
        x: curPos,
        y: PURLIN_HEIGHT + 1.5 * SUPPORT_RAIDUS + LAP_OFFSET_Y / 2 ,
        sides: 3,
        radius: 1,
        strokeWidth: 1 / zoom,
        ...SUPPORT_STYLE,
      });
      shapes.push(left);
    }
    curPos += item.span - item.rightLap / 2 - item.leftLap / 2;
    let right = new Konva.RegularPolygon({
      x: curPos,
      y: PURLIN_HEIGHT + 1.5 * SUPPORT_RAIDUS + LAP_OFFSET_Y / 2,
      sides: 3,
      radius: 1,
      strokeWidth: 1 / zoom,
      ...SUPPORT_STYLE,
    });
    shapes.push(right);
  })

  return shapes;
}



type PurLinViewProps = {
  data: Array<PurlinData>
}

type PurlinData = {
  index: number,
  leftLap: number,
  span: number,
  rightLap: number
}