import { Group, Arrow, Line, Text } from "react-konva";

export default function DistanceDimension({startPoint, endPoint, distanceValue, distanceUnit, scale = 1}: DistanceDimensionProps) {

  const extensionLength = 50 * scale
  const extendBeyond = 10 * scale
  const pointerWidth = 6 * scale
  const pointerLength = pointerWidth * 1.25
  const fontSize = 14 * scale
  const lineWidth = 0.5 * scale

  const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
  const localStart = {x: 0, y: 0}
  const localEnd = {x: distance, y: 0}
  const globalRotation = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180.0 / Math.PI

  const dimStart = {x: localStart.x, y: localStart.y + extensionLength}
  const dimEnd = {x: localEnd.x, y: localEnd.y + extensionLength}
  const extend1Start = {x: localStart.x, y: localStart.y + extendBeyond}
  const extend1End= {x: localStart.x, y: localStart.y + extensionLength + extendBeyond}
  const extend2Start = {x: localEnd.x, y: localEnd.y + extendBeyond}
  const extend2End = {x: localEnd.x, y: localEnd.y + extensionLength + extendBeyond}

  if (!distanceValue) distanceValue = distance
  const text = `${distanceValue.toFixed(1)} ${distanceUnit}`

  return (
    <Group
      rotation={globalRotation}
      x={startPoint.x}
      y={startPoint.y}
    >
      <Arrow
        points={[...Object.values(dimStart), ...Object.values(dimEnd)]}
        stroke="#020617"
        strokeWidth={lineWidth}
        fill="#020617"
        pointerWidth={pointerWidth}
        pointerLength={pointerLength}
        pointerAtBeginning={true}
        pointerAtEnding={true}
      />
      <Line
        points={[...Object.values(extend1Start), ...Object.values(extend1End)]}
        stroke="#020617"
        strokeWidth={lineWidth}
      />
      <Line
        points={[...Object.values(extend2Start), ...Object.values(extend2End)]}
        stroke="#020617"
        strokeWidth={lineWidth}
      />
      <Text
        text={text}
        align="center"
        verticalAlign="top"
        fontSize={fontSize}
        x={0}
        y={extensionLength + extendBeyond}
        width={distance}
      />
    </Group>
  );
}

type DistanceDimensionProps = {
  startPoint: Position,
  endPoint: Position,
  distanceValue?: number,
  distanceUnit?: string,
  scale?: number
}

type Position = {
  x: number,
  y: number,
}