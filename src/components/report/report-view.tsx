import { PDFViewer } from "@react-pdf/renderer";
import { Empty } from "antd";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { AnalaysisData } from "../results/results-display";
import ReportDocument from "./report-document";

export default function ReportView({
  input,
  output,
}: {
  input: PurLinLineState;
  output: AnalaysisData | null;
}) {
  if (!output) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-white rounded-lg shadow-sm">
        <Empty description="Run a calculation first to generate the report" />
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] rounded-lg overflow-hidden shadow-sm">
      <PDFViewer width="100%" height="100%" showToolbar>
        <ReportDocument input={input} output={output} />
      </PDFViewer>
    </div>
  );
}
