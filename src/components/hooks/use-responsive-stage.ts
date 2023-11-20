import { MutableRefObject, useEffect } from "react"
import Konva from 'konva';

export function useResponsiveStage({ stageRef, containerRef, boundingBox, setZoom }: ResponsiveStageReducerProps) {
  
  useEffect(() => {
    function handleResize() {
      // Resize stage to match container size
      stageRef.current.width(containerRef.current.offsetWidth);
      stageRef.current.height(containerRef.current.offsetHeight);
      
      console.log(containerRef.current.offsetWidth)
  
      const xc = containerRef.current.offsetWidth / 2;
      const yc = containerRef.current.offsetHeight / 2;

      // Calculate best zoom ratio
      const sceneWidth = stageRef.current.width();
      const sceneHeight = stageRef.current.height();
      const bestZoom = Math.min(0.8 * sceneWidth / boundingBox.width, 0.8 * sceneHeight / boundingBox.height);
      setZoom(bestZoom);

      // Apply scale
      stageRef.current.scale({x: bestZoom, y: bestZoom});
  
      // Shift to center
      stageRef.current.position({x: xc - boundingBox.x * bestZoom, y: yc - boundingBox.y * bestZoom});
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return (() => {
      window.removeEventListener("resize", handleResize);
    });

  }, [stageRef, containerRef, boundingBox, setZoom])
}

type ResponsiveStageReducerProps = {
  stageRef: MutableRefObject<Konva.Stage>,
  containerRef: MutableRefObject<HTMLDivElement>,
  boundingBox: {x: number, y: number, width: number, height: number},
  setZoom: (v: number) => void,
}