import { PurLinLineState } from "../hooks/use-purlin-line";

const DEFAULT_EXISTING_PURLIN = "Z8x2.5 060";

export function mapGeometryToJSON(state: PurLinLineState) {
  return JSON.stringify({
    purlin_types: [DEFAULT_EXISTING_PURLIN],
    purlin_spans: state.spans.map(item => item.value),
    purlin_size_span_assignment: state.spans.map(() => 1),
    purlin_laps: Array(2 * (state.spans.length - 1)).fill(state.lapLength / 2),
    purlin_spacing: state.spacing,
    frame_flange_width: state.frameFlangeWidth,
    roof_slope: state.roofSlope,
    deck_type: state.deckType,
    loading_direction: state.loadDirection,
    intelli_frame_type: state.crossSection,
    purlin_frame_connection: "Clip-mounted",
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
