import { Layer, Rect, Stage } from "react-konva";
import Konva from "konva";
import { useEffect, useRef } from "react";


export default function Playground() {

  const stageRef = useRef<Konva.Stage>(null!)

  useEffect(() => {
    stageRef.current.width(window.innerWidth);
    stageRef.current.height(window.innerHeight);

    const center = {x: window.innerWidth / 2, y: window.innerHeight / 2};
    const prevScale = 1
    const curScale = 1;

    const prevPos = {
      x: (center.x - stageRef.current.x()) / prevScale, 
      y: (center.y - stageRef.current.y()) / prevScale,
    };
    const curPos = {
      x: center.x - prevPos.x * curScale , 
      y: center.y - prevPos.y * curScale ,
    }

    stageRef.current.scale({x: curScale, y: curScale});
    stageRef.current.position(curPos);

  }, [])

  return (
    <Stage 
      ref={stageRef}
      scale={{x: 1, y: 1}}
    >
      <Layer>
        <Rect
          x={1823/2}
          y={770/2}
          offset={{x: 100 / 2, y: 200 / 2}}
          width={100}
          height={200}
          stroke="#f87171"
        />
      </Layer>
    </Stage>
  );
}