import { PurLinLineState } from "../hooks/use-purlin-line";

export function mapGeometryToJSON(state: PurLinLineState) {
  return JSON.stringify({
    purlin_types: [state.crossSection],
    purlin_spans: state.spans.map(item => item.value),
    purlin_size_span_assignment: state.spans.map(() => 1),
    purlin_laps: Array(2 * (state.spans.length - 1)).fill(state.lapLength / 2),
    purlin_spacing: state.spacing,
    frame_flange_width: state.frameFlangeWidth,
    roof_slope: state.roofSlope,
    deck_type: state.deckType,
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

/** The report inputs without the timestamp: equal fingerprints mean the same report. */
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

/** Body of POST /intelliframe/export-pdf: the analysis inputs, the report header and the report type. */
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
