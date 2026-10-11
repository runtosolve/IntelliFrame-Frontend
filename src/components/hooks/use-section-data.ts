import { useEffect, useState } from "react"

type SectionLibraries = {
  purlin: PurlinSectionLibrary,
  intelliFrame: PurlinSectionLibrary,
}

let cachedLibraries: SectionLibraries | null = null;
let pendingLibraries: Promise<SectionLibraries> | null = null;

function loadSectionLibraries(): Promise<SectionLibraries> {
  if (cachedLibraries) return Promise.resolve(cachedLibraries);
  if (!pendingLibraries) {
    const read = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to load section data from ${url} (${response.status})`);
      }
      return response.json();
    };
    pendingLibraries = Promise.all([
      read("/data/Purlins.json"),
      read("/data/IntelliFrameRF.json"),
    ])
      .then(([purlins, intelliFrame]) => {
        cachedLibraries = {
          purlin: createSectionLibrary(purlins) as PurlinSectionLibrary,
          intelliFrame: createSectionLibrary(intelliFrame) as PurlinSectionLibrary,
        };
        return cachedLibraries;
      })
      .catch((error) => {
        pendingLibraries = null;
        throw error;
      });
  }
  return pendingLibraries;
}

export default function useSectionData(): [PurlinSectionLibrary, PurlinSectionLibrary] {
  const [libraries, setLibraries] = useState<SectionLibraries | null>(cachedLibraries);

  useEffect(() => {
    if (libraries) return;
    let active = true;
    loadSectionLibraries()
      .then((loaded) => {
        if (active) setLibraries(loaded);
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
  }, [libraries]);

  return [libraries?.purlin ?? {}, libraries?.intelliFrame ?? {}];
}


type PurlinSectionLibrary = {
  [key: string]: PurlinSectionData
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

function createSectionLibrary(sectionArr: PurlinSectionData[]) {
  const sectionLibrary: PurlinSectionLibrary = {};
  sectionArr.forEach((section) => {
    sectionLibrary[section.name] = section;
  });
  return sectionLibrary;
}
