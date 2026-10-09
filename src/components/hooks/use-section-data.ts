import { useEffect, useState } from "react"

export default function useSectionData(): [PurlinSectionLibrary, DeckSectionLibrary] {
  const [purlinSectionLibrary, setPurlinSectionLibrary] = useState<PurlinSectionLibrary>({});
  const [deckSectionLibrary, setDeckSectionLibrary] = useState<DeckSectionLibrary>({});

  useEffect(() => {
    fetch("/data/IntelliFrameRF.json")
      .then((res) => res.json())
      .then((data) => {
        setPurlinSectionLibrary(createSectionLibrary(data) as PurlinSectionLibrary);
      });
  }, []);

  useEffect(() => {
    fetch("/data/Decks.json")
      .then((res) => res.json())
      .then((data) => {
        setDeckSectionLibrary(createSectionLibrary(data) as DeckSectionLibrary);
      });
  }, []);


  return [purlinSectionLibrary, deckSectionLibrary];
}


export type PurlinSectionLibrary = {
  [key: string]: PurlinSectionData
}

export type DeckSectionLibrary = {
  [key: string]: DeckSectionData
}

export type PurlinSectionData = {
  name: string,
  shape: "C" | "Z",
  D: number,
  B: number,
  B_bottom?: number,
  B_top?: number,
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

function createSectionLibrary(sectionArr: PurlinSectionData[] | DeckSectionData[]) {
  const sectionLibrary: PurlinSectionLibrary | DeckSectionLibrary = {};
  sectionArr.forEach((section) => {
    sectionLibrary[section.name] = section;
  });
  return sectionLibrary;
}