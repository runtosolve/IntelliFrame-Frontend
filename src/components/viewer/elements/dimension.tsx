import { Group, Arrow, Line, Text } from "react-konva";

export default function DistanceDimension({
  startPoint,
  endPoint,
  distanceValue,
  distanceUnit,
  scale = 1,
  color = "#020617",
  side = "below",
  label,
  centerLabel,
  extension = 50,
}: DistanceDimensionProps) {

  const extensionLength = extension * scale
  const extendBeyond = 10 * scale
  const pointerWidth = 6 * scale
  const pointerLength = pointerWidth * 1.25
  const fontSize = 14 * scale
  const centerFontSize = 13 * scale
  const lineWidth = 0.5 * scale
  const direction = side === "above" ? -1 : 1

  const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
  const localStart = {x: 0, y: 0}
  const localEnd = {x: distance, y: 0}
  const globalRotation = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180.0 / Math.PI

  const dimStart = {x: localStart.x, y: localStart.y + direction * extensionLength}
  const dimEnd = {x: localEnd.x, y: localEnd.y + direction * extensionLength}
  const extend1Start = {x: localStart.x, y: localStart.y + direction * extendBeyond}
  const extend1End= {x: localStart.x, y: localStart.y + direction * (extensionLength + extendBeyond)}
  const extend2Start = {x: localEnd.x, y: localEnd.y + direction * extendBeyond}
  const extend2End = {x: localEnd.x, y: localEnd.y + direction * (extensionLength + extendBeyond)}

  if (!distanceValue) distanceValue = distance
  const bottomText = label ?? `${distanceValue.toFixed(1)} ${distanceUnit ?? ""}`.trim()
  const centerTextWidth = Math.max(centerFontSize * (centerLabel?.length ?? 0) * 0.62, centerFontSize * 1.6)
  const centerTextHeight = centerFontSize * 1.15
  const centerTextX = (distance - centerTextWidth) / 2
  const valueTextWidth = Math.max(distance, fontSize * Math.max(bottomText.length, 4) * 0.56)
  const valueTextX = (distance - valueTextWidth) / 2
  const centerGap = 4 * scale
  const valueGap = 5 * scale
  const centerTextY = side === "above"
    ? direction * extensionLength - centerTextHeight - centerGap
    : extensionLength - centerTextHeight - centerGap
  const textY = centerLabel
    ? (side === "above"
      ? direction * extensionLength + valueGap
      : extensionLength + valueGap)
    : (side === "above"
      ? direction * (extensionLength + extendBeyond) - fontSize
      : extensionLength + extendBeyond)

  return (
    <Group
      rotation={globalRotation}
      x={startPoint.x}
      y={startPoint.y}
    >
      <Arrow
        points={[...Object.values(dimStart), ...Object.values(dimEnd)]}
        stroke={color}
        strokeWidth={lineWidth}
        fill={color}
        pointerWidth={pointerWidth}
        pointerLength={pointerLength}
        pointerAtBeginning={true}
        pointerAtEnding={true}
      />
      <Line
        points={[...Object.values(extend1Start), ...Object.values(extend1End)]}
        stroke={color}
        strokeWidth={lineWidth}
      />
      <Line
        points={[...Object.values(extend2Start), ...Object.values(extend2End)]}
        stroke={color}
        strokeWidth={lineWidth}
      />
      {centerLabel && (
        <Text
          text={centerLabel}
          align="center"
          verticalAlign="middle"
          fontSize={centerFontSize}
          fontStyle="bold"
          fill={color}
          x={centerTextX}
          y={centerTextY}
          width={centerTextWidth}
          height={centerTextHeight}
          wrap="none"
        />
      )}
      <Text
        text={bottomText}
        align="center"
        verticalAlign="top"
        fontSize={fontSize}
        fill={color}
        x={valueTextX}
        y={textY}
        width={valueTextWidth}
        wrap="none"
      />
    </Group>
  );
}

type DistanceDimensionProps = {
  startPoint: Position,
  endPoint: Position,
  distanceValue?: number,
  distanceUnit?: string,
  scale?: number,
  color?: string,
  side?: "above" | "below",
  label?: string,
  centerLabel?: string,
  extension?: number,
}

type Position = {
  x: number,
  y: number,
}
