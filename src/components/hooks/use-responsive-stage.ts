import { MutableRefObject, useEffect } from "react"
import Konva from 'konva';

export function useResponsiveStage({ stageRef, containerRef, boundingBox, setZoom, padding }: ResponsiveStageReducerProps) {
  const padTop = padding?.top ?? 0;
  const padRight = padding?.right ?? 0;
  const padBottom = padding?.bottom ?? 0;
  const padLeft = padding?.left ?? 0;

  useEffect(() => {
    function handleResize() {
      if (!stageRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        boundingBox.width <= 0 ||
        boundingBox.height <= 0
      ) {
        return;
      }

      const sceneWidth = rect.width;
      const sceneHeight = rect.height;
      const fitWidth = sceneWidth - padLeft - padRight;
      const fitHeight = sceneHeight - padTop - padBottom;
      if (fitWidth <= 0 || fitHeight <= 0) return;
      const bestZoom = Math.min(0.94 * fitWidth / boundingBox.width, 0.94 * fitHeight / boundingBox.height);
      if (!Number.isFinite(bestZoom) || bestZoom <= 0) return;

      const currentScale = stageRef.current.scaleX();
      const unchangedSize = stageRef.current.width() === sceneWidth
        && stageRef.current.height() === sceneHeight
        && Math.abs(currentScale - bestZoom) < 0.01;
      if (unchangedSize) return;

      stageRef.current.width(sceneWidth);
      stageRef.current.height(sceneHeight);
      setZoom(bestZoom);
      stageRef.current.scale({x: bestZoom, y: bestZoom});
      stageRef.current.position({
        x: padLeft + fitWidth / 2 - boundingBox.x * bestZoom,
        y: padTop + fitHeight / 2 - boundingBox.y * bestZoom,
      });
    }

    handleResize();

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    if (resizeObserver) {
      resizeObserver.observe(containerRef.current);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    stageRef,
    containerRef,
    boundingBox.x,
    boundingBox.y,
    boundingBox.width,
    boundingBox.height,
    setZoom,
    padTop,
    padRight,
    padBottom,
    padLeft,
  ])
}

type ResponsiveStageReducerProps = {
  stageRef: MutableRefObject<Konva.Stage>,
  containerRef: MutableRefObject<HTMLDivElement>,
  boundingBox: {x: number, y: number, width: number, height: number},
  setZoom: (v: number) => void,
  padding?: {top?: number, right?: number, bottom?: number, left?: number},
}