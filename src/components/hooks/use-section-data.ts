import { useEffect, useState } from "react"

export default function useSectionData(): [PurlinSectionData[], DeckSectionData[]] {
  const [purlinSectionDataArray, setPurlinSectionDataArray] = useState<PurlinSectionData[]>([]);
  const [deckSectionDataArray, setDeckSectionDataArray] = useState<DeckSectionData[]>([]);

  useEffect(() => {
    fetch("/data/Purlins.json")
      .then((res) => res.json())
      .then((data) => {
        setPurlinSectionDataArray(data);
      });
  }, []);

  useEffect(() => {
    fetch("/data/Decks.json")
      .then((res) => res.json())
      .then((data) => {
        setDeckSectionDataArray(data);
      });
  }, []);


  return [purlinSectionDataArray, deckSectionDataArray];
}


export type PurlinSectionData = {
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

export type DeckSectionData = {
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