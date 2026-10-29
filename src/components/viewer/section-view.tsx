import Konva from "konva";
import { useMemo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { getSectionDrawing, SectionDrawingView } from "@/components/viewer/elements/cross-section";
import { getDimensionLayout } from "@/components/viewer/elements/section-dimensions";
import useSectionData from "@/components/hooks/use-section-data";
import { useResponsiveStage } from "../hooks/use-responsive-stage";

export default function SectionView({
  purlinName,
  existingName,
  catalog = "purlin",
  rotation = 0,
  loadDirection,
}: SectionViewProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  const [purlinSectionLibrary, intelliFrameLibrary] = useSectionData();
  const retrofit = catalog === "intelliframe";
  const section = retrofit ? intelliFrameLibrary[purlinName] : purlinSectionLibrary[purlinName];
  const existing = retrofit && existingName ? purlinSectionLibrary[existingName] : undefined;

  const analysis = loadDirection !== undefined;
  const drawing = useMemo(() => (section ? getSectionDrawing(section, existing) : undefined), [section, existing]);
  const layout = useMemo(
    () => (drawing ? getDimensionLayout(drawing, { analysis }) : undefined),
    [drawing, analysis],
  );
  const box = layout
    ? {
      x: layout.bounds.cx,
      y: layout.bounds.cy,
      width: layout.bounds.maxX - layout.bounds.minX,
      height: layout.bounds.maxY - layout.bounds.minY,
    }
    : { x: 0, y: 0, width: 10, height: 10 };

  const ready = useResponsiveStage({
    stageRef,
    containerRef,
    boundingBox: box,
    setZoom,
    padding: analysis ? ANALYSIS_SECTION_PADDING : SECTION_PADDING,
  });

  return (
    <div
      ref={containerRef}
      className="absolute w-full h-full"
      style={{ visibility: ready && drawing ? "visible" : "hidden" }}
    >
      <Stage ref={stageRef}>
        <Layer listening={false}>
          {drawing && layout && (
            <SectionDrawingView
              drawing={drawing}
              layout={layout}
              zoom={zoom}
              rotation={rotation}
              loadDirection={loadDirection}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

const SECTION_PADDING = { top: 48, bottom: 28, left: 36, right: 24 };
const ANALYSIS_SECTION_PADDING = { top: 22, bottom: 20, left: 18, right: 24 };

type SectionViewProps = {
  purlinName: string,
  existingName?: string,
  catalog?: "purlin" | "intelliframe",
  rotation: number,
  loadDirection?: "gravity" | "uplift",
}
