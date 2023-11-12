


type PurlinSectionData = {
  name: string,
  shape: "C" | "Z",
  D: number,
  B: number,
  H: number,
  t: number,
  r: number,
  webAngle: number,
  flangeAngle: number,
  lipAngle: number,
}

type DeckSectionData = {
  name: string,
  t: number,
  connector: "fastener" | "clip",
  connectorData: FastenerData | clipData,
}

type FastenerData = {
  spacing: number,
  diameter: number,
  shearStrength: number,
}

type clipData = {
  height: number,
  spacing: number
}