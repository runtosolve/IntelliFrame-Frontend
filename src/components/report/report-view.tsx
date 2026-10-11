import { PDFViewer } from "@react-pdf/renderer";
import { Empty } from "antd";
import { memo } from "react";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { AnalaysisData } from "../results/results-display";
import ReportDocument from "./report-document";

export default memo(function ReportView({
  input,
  output,
  title,
}: {
  input: PurLinLineState | null;
  output: AnalaysisData | null;
  title?: string;
}) {
  if (!input || !output) {
    return (
      <div className="report-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Run an analysis to generate the engineering report"
        />
      </div>
    );
  }

  return (
    <div className="report-shell">
      <PDFViewer width="100%" height="100%" showToolbar>
        <ReportDocument input={input} output={output} title={title} />
      </PDFViewer>
    </div>
  );
});
