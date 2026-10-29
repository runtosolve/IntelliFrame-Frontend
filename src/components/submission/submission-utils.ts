import { PurLinLineState } from "../hooks/use-purlin-line";
import deckData from "../../data/Decks.json";

const DECK_API_NAME_BY_LABEL: Record<string, string> = Object.fromEntries(
  deckData.map((deck) => [deck.name, (deck as { apiName?: string }).apiName ?? deck.name]),
);

export function toApiDeckType(deckType: string) {
  return DECK_API_NAME_BY_LABEL[deckType] ?? deckType;
}

export function mapGeometryToJSON(state: PurLinLineState) {
  return JSON.stringify({
    purlin_types: [state.crossSection],
    purlin_spans: state.spans.map(item => item.value),
    purlin_size_span_assignment: state.spans.map(() => 1),
    purlin_laps: Array.from({ length: Math.max(0, state.spans.length - 1) }, () => [
      state.lapNegZ,
      state.lapPosZ,
    ]).flat(),
    purlin_spacing: state.spacing,
    frame_flange_width: state.frameFlangeWidth,
    roof_slope: state.roofSlope,
    deck_type: toApiDeckType(state.deckType),
    loading_direction: state.loadDirection,
    intelli_frame_type: state.intelliFrameSection,
    purlin_frame_connection: "Clip-mounted",
  });
}

export type ProjectInfo = {
  projectName: string;
  projectLocation: string;
  projectReference: string;
  clientName: string;
  revisionNo: string;
};

export type ReportType = "summary" | "detailed";

export function reportFingerprint(state: PurLinLineState, project: ProjectInfo) {
  return JSON.stringify({
    ...JSON.parse(mapGeometryToJSON({ ...state, loadDirection: "gravity" })),
    project_name: project.projectName.trim(),
    project_location: project.projectLocation.trim(),
    project_reference: project.projectReference.trim(),
    client_name: project.clientName.trim(),
    revision_no: project.revisionNo.trim(),
  });
}

export function mapReportToJSON(state: PurLinLineState, project: ProjectInfo, reportType: ReportType) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return JSON.stringify({
    ...JSON.parse(reportFingerprint(state, project)),
    design_report_date: `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    report_type: reportType,
  });
}

export function mapStateToJSON(
  state: PurLinLineState,
  analysisType: "existing" | "retrofit" = "existing",
) {
  return JSON.stringify({
    ...JSON.parse(mapGeometryToJSON(state)),
    analysis_type: analysisType,
    generate_report: true,
  });
}
