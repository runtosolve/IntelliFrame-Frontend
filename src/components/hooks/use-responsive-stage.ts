import { MutableRefObject, useEffect } from "react"
import Konva from 'konva';

export function useResponsiveStage({ stageRef, containerRef, targetZoom }: ResponsiveStageReducerProps) {
  useEffect(() => {
    // Resize stage to match container
    stageRef.current.width(containerRef.current.offsetWidth);
    stageRef.current.height(containerRef.current.offsetHeight);

    // Update stage zoom to best show content
    // Always zoom from the center of the container
    const zoomCenter = {
      x: containerRef.current.offsetWidth / 2, 
      y: containerRef.current.offsetHeight / 2};
    const oldZoom = stageRef.current.scaleX(); // always assume uniform scale
    const oldStagePos = {
      x: zoomCenter.x - stageRef.current.x(),
      y: zoomCenter.y - stageRef.current.y(),
    }
    const newStagePos = {
      x: zoomCenter.x - oldStagePos.x / oldZoom * targetZoom,
      y: zoomCenter.y - oldStagePos.y / oldZoom * targetZoom,
    }

    // Update stage scale and position
    stageRef.current.scale({x: targetZoom, y: targetZoom});
    stageRef.current.position(newStagePos);

  }, [stageRef, containerRef, targetZoom])
}

type ResponsiveStageReducerProps = {
  stageRef: MutableRefObject<Konva.Stage>,
  containerRef: MutableRefObject<HTMLDivElement>,
  targetZoom: number,
}