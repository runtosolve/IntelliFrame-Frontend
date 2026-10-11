import { MutableRefObject, useLayoutEffect, useState } from "react"
import Konva from 'konva';

export function useResponsiveStage({ stageRef, containerRef, boundingBox, setZoom, padding }: ResponsiveStageReducerProps) {
  const [ready, setReady] = useState(false);
  const padTop = padding?.top ?? 0;
  const padRight = padding?.right ?? 0;
  const padBottom = padding?.bottom ?? 0;
  const padLeft = padding?.left ?? 0;

  useLayoutEffect(() => {
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

      const hScale = Math.min(1, (0.6 * sceneWidth) / Math.max(padLeft + padRight, 1));
      const vScale = Math.min(1, (0.6 * sceneHeight) / Math.max(padTop + padBottom, 1));
      const left = padLeft * hScale;
      const top = padTop * vScale;
      const fitWidth = sceneWidth - left - padRight * hScale;
      const fitHeight = sceneHeight - top - padBottom * vScale;
      if (fitWidth <= 0 || fitHeight <= 0) return;
      const bestZoom = Math.min(0.94 * fitWidth / boundingBox.width, 0.94 * fitHeight / boundingBox.height);
      if (!Number.isFinite(bestZoom) || bestZoom <= 0) return;

      const x = left + fitWidth / 2 - boundingBox.x * bestZoom;
      const y = top + fitHeight / 2 - boundingBox.y * bestZoom;
      const stage = stageRef.current;
      const unchanged = stage.width() === sceneWidth
        && stage.height() === sceneHeight
        && Math.abs(stage.scaleX() - bestZoom) < 1e-4
        && Math.abs(stage.x() - x) < 0.5
        && Math.abs(stage.y() - y) < 0.5;
      if (!unchanged) {
        stage.width(sceneWidth);
        stage.height(sceneHeight);
        stage.scale({ x: bestZoom, y: bestZoom });
        stage.position({ x, y });
        setZoom(bestZoom);
      }
      setReady(true);
    }

    handleResize();

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    if (resizeObserver) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
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

  return ready;
}

type ResponsiveStageReducerProps = {
  stageRef: MutableRefObject<Konva.Stage>,
  containerRef: MutableRefObject<HTMLDivElement>,
  boundingBox: {x: number, y: number, width: number, height: number},
  setZoom: (v: number) => void,
  padding?: {top?: number, right?: number, bottom?: number, left?: number},
}
