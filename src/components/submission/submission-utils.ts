import { PurLinLineState } from "../hooks/use-purlin-line";

export function mapStateToJSON(state: PurLinLineState) {
  const data = {
    purlin_types: [state.crossSection],
    purlin_spans: state.spans.map(item => item.value),
    purlin_size_span_assignment: Array(2 * state.spans.length).fill(1),
    purlin_laps: Array(2 * (state.spans.length - 1)).fill(state.lapLength),
    purlin_spacing: state.spacing,
    frame_flange_width: state.frameFlangeWidth,
    roof_slope: state.roofSlope,
    deck_type: state.deckType,
  };

  return JSON.stringify(data);
}