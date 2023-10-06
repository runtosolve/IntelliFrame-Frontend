import { useEffect, useRef } from "react";
import { Stage } from "react-konva";
import Konva from "konva"

export default function PurlinView({data}: PurLinViewProps) {

  const containerRef = useRef<HTMLDivElement>(null!)
  const stageRef = useRef<Konva.Stage>(null!)


  useEffect(() => {
    stageRef.current.width(containerRef.current.offsetWidth)
    stageRef.current.height(containerRef.current.offsetHeight)

    const layer = new Konva.Layer()
    stageRef.current.add(layer)
    
    const {objs: rects, center} = createPurlins(data)
    console.log(rects)
    layer.add(...rects)
    layer.x(stageRef.current.width() / 2 - center.x)
    layer.y(stageRef.current.height() / 2 - center.y)
    
    return (() => {
      for (const rect of rects) {
        rect.destroy()
      }
      layer.destroy()
    })

  }, [data])


  return (
    <div ref={containerRef} className="w-full aspect-video rounded-lg overflow-hidden mb-8 bg-gray-300">
      <Stage ref={stageRef}>
      </Stage>
    </div>
  )
}

const RECT_STYLES = {
  fill: "#1e293",
  stroke: "#1e293b",
}

function createPurlins(data: Array<PurlinData>) {
  const objs: Array<Konva.Rect> = []

  let xPos = 0
  let yPos = 0

  for (const item of data) {
    let cur = new Konva.Rect({ width: item.span, height: 8/12, x: xPos, y: yPos, ...RECT_STYLES})
    objs.push(cur)
    xPos += item.span - item.rightLap
    yPos = (yPos < 0) ? (0) : (-1)
  }

  const center = {
    x: xPos / 2,
    y: 1,
  }

  return {objs, center}
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