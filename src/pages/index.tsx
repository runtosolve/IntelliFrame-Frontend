import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine, { type PurLinLineState } from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import Footer from "@/components/layout/footer";
import { DeflectionCard, ResultStats, type AnalaysisData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Button, Card, Input, Tag } from "antd";
import {
  BarChartOutlined,
  ExperimentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { mapGeometryToJSON } from "@/components/submission/submission-utils";

const ReportViewNoSSR = dynamic(() => import("@/components/report/report-view"), {
  ssr: false,
});

type AnalysisRunKey = "existing-gravity" | "existing-uplift" | "retrofit-gravity" | "retrofit-uplift";

const SUMMARY_RUNS: Array<{ key: AnalysisRunKey; title: string; direction: "gravity" | "uplift" }> = [
  { key: "existing-gravity", title: "Gravity - Existing roof analysis", direction: "gravity" },
  { key: "existing-uplift", title: "Uplift - Existing roof analysis", direction: "uplift" },
  { key: "retrofit-gravity", title: "Gravity - Retrofitted roof analysis", direction: "gravity" },
  { key: "retrofit-uplift", title: "Uplift - Retrofitted roof analysis", direction: "uplift" },
];

const EMPTY_RUNS: Record<AnalysisRunKey, AnalaysisData | null> = {
  "existing-gravity": null,
  "existing-uplift": null,
  "retrofit-gravity": null,
  "retrofit-uplift": null,
};

const EMPTY_RUN_INPUTS: Record<AnalysisRunKey, PurLinLineState | null> = {
  "existing-gravity": null,
  "existing-uplift": null,
  "retrofit-gravity": null,
  "retrofit-uplift": null,
};

type ProjectInfo = {
  projectName: string;
  projectLocation: string;
  projectReference: string;
  clientName: string;
  revisionNo: string;
};

const PROJECT_FIELDS: Array<{
  key: keyof ProjectInfo;
  label: string;
  maxLength: number;
  inputMode?: "numeric";
}> = [
  { key: "projectName", label: "Project name", maxLength: 80 },
  { key: "projectLocation", label: "Project location", maxLength: 80 },
  { key: "projectReference", label: "Project reference", maxLength: 80 },
  { key: "clientName", label: "Client name", maxLength: 120 },
  { key: "revisionNo", label: "Revision no.", maxLength: 10, inputMode: "numeric" },
];

const PROJECT_PLACEHOLDERS: Record<keyof ProjectInfo, string> = {
  projectName: "e.g. Warehouse roof retrofit",
  projectLocation: "City, State",
  projectReference: "Job or quote number",
  clientName: "Owner or contractor",
  revisionNo: "0",
};

function isRunStale(
  runInput: PurLinLineState | null,
  current: PurLinLineState,
  direction: "gravity" | "uplift" | undefined,
) {
  if (!runInput || !direction) return false;
  return mapGeometryToJSON(runInput) !== mapGeometryToJSON({ ...current, loadDirection: direction });
}

export default function Home() {
  const [inputData, inputDataDispatch] = usePurlinLine();
  const [runs, setRuns] = useState<Record<AnalysisRunKey, AnalaysisData | null>>(EMPTY_RUNS);
  const [runInputs, setRunInputs] = useState<Record<AnalysisRunKey, PurLinLineState | null>>(EMPTY_RUN_INPUTS);
  const [activeTab, setActiveTab] = useState("project");
  const [project, setProject] = useState<ProjectInfo>({
    projectName: "",
    projectLocation: "",
    projectReference: "",
    clientName: "",
    revisionNo: "",
  });
  const [selectedRunKey, setSelectedRunKey] = useState<AnalysisRunKey | null>(null);
  const [selectedReportKey, setSelectedReportKey] = useState<AnalysisRunKey | null>(null);

  const handleResult = (result: AnalaysisData | null, submittedInput?: PurLinLineState) => {
    const run = SUMMARY_RUNS.find((item) => item.key === activeTab);
    if (run) {
      setRuns((current) => ({ ...current, [run.key]: result }));
      setRunInputs((current) => ({
        ...current,
        [run.key]: result
          ? { ...(submittedInput ?? inputData), loadDirection: run.direction }
          : null,
      }));
      if (result) {
        setSelectedRunKey(run.key);
        setSelectedReportKey(run.key);
      }
    }
  };

  useEffect(() => {
    const direction = activeTab.endsWith("-uplift")
      ? "uplift"
      : activeTab.endsWith("-gravity")
        ? "gravity"
        : null;
    if (direction && inputData.loadDirection !== direction) {
      inputDataDispatch({ type: "set", field: "loadDirection", payload: direction });
    }
  }, [activeTab, inputData.loadDirection, inputDataDispatch]);

  const completedRuns = SUMMARY_RUNS.filter((run) => runs[run.key]);
  const selectedRun = completedRuns.find((run) => run.key === selectedRunKey)
    ?? completedRuns[completedRuns.length - 1]
    ?? null;
  const selectedRunInput = selectedRun ? runInputs[selectedRun.key] : null;
  const selectedRunDirection = selectedRun?.direction;
  const isStale = useMemo(
    () => isRunStale(selectedRunInput, inputData, selectedRunDirection),
    [selectedRunInput, inputData, selectedRunDirection],
  );
  const reportRuns = completedRuns.filter((run) => runInputs[run.key]);
  const selectedReport = reportRuns.find((run) => run.key === selectedReportKey)
    ?? reportRuns[reportRuns.length - 1]
    ?? null;
  const selectedReportInput = selectedReport ? runInputs[selectedReport.key] : null;
  const selectedReportOutput = selectedReport ? runs[selectedReport.key] : null;
  const selectedReportDirection = selectedReport?.direction;
  const isReportStale = useMemo(
    () => isRunStale(selectedReportInput, inputData, selectedReportDirection),
    [selectedReportInput, inputData, selectedReportDirection],
  );

  const runSwitch = (
    items: typeof SUMMARY_RUNS,
    selectedKey: AnalysisRunKey | undefined,
    onSelect: (key: AnalysisRunKey) => void,
  ) => (
    <div className="summary-chart-switch" role="radiogroup" aria-label="Analysis case">
      {items.map((run) => {
        const selected = selectedKey === run.key;
        return (
          <button
            key={run.key}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? "active" : ""}
            onClick={() => onSelect(run.key)}
          >
            {run.title}
          </button>
        );
      })}
    </div>
  );

  const pageHeading = (kicker: string, title: string, description: string, action?: ReactNode) => (
    <div className="analysis-toolbar">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );

  const renderProjectPage = () => (
    <div className="project-page">
      <section className="project-details" aria-labelledby="project-details-title">
        <h1 id="project-details-title" className="project-details-title">
          <FolderOpenOutlined aria-hidden />
          <span className="section-title">Project information</span>
        </h1>
        <div className="project-details-body">
          <div className="project-fields">
            {PROJECT_FIELDS.map(({ key, label, maxLength, inputMode }) => {
              const id = `project-${key}`;
              return (
                <div key={key} className="project-row">
                  <label htmlFor={id} className="project-label">{label}</label>
                  <Input
                    id={id}
                    name={key}
                    value={project[key]}
                    maxLength={maxLength}
                    inputMode={inputMode}
                    autoComplete="off"
                    placeholder={PROJECT_PLACEHOLDERS[key]}
                    onChange={(event) => setProject((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </div>
              );
            })}
          </div>

          <aside className="project-preview" aria-label="Report header preview">
            <span className="project-preview-kicker">Report header</span>
            <p className="project-preview-name">{project.projectName.trim() || "Untitled project"}</p>
            <p className="project-preview-location">{project.projectLocation.trim() || "Location not set"}</p>
            <dl className="project-preview-meta">
              <div>
                <dt>Reference</dt>
                <dd>{project.projectReference.trim() || "—"}</dd>
              </div>
              <div>
                <dt>Client</dt>
                <dd>{project.clientName.trim() || "—"}</dd>
              </div>
              <div>
                <dt>Revision</dt>
                <dd>{project.revisionNo.trim() || "—"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </div>
  );

  const buildCasePage = (scope: "existing" | "retrofit", direction: "gravity" | "uplift") => (
    <div className="analysis-workspace">
      {pageHeading(
        scope === "existing" ? "Existing roof analysis" : "Retrofitted roof analysis",
        direction === "gravity" ? "Gravity Build" : "Uplift Build",
        direction === "gravity"
          ? "Set the purlin section and framing geometry. Load direction is gravity, and the framing layout shows the load downward. The Uplift Build uses these same values."
          : "Values come from the Gravity Build and are read only here. Load direction is uplift, and the framing layout shows the load upward.",
        <SubmitButton
          input={{ ...inputData, loadDirection: direction }}
          analysisType={scope}
          onUpdate={handleResult}
        />
      )}
      <div className="analysis-grid">
        <aside className="analysis-sidebar" aria-label="Purlin inputs">
          <ClientInput
            state={inputData}
            dispatch={inputDataDispatch}
            part="section"
            fixedLoadDirection={direction}
            sectionCatalog={scope === "retrofit" ? "intelliframe" : "purlin"}
            readOnly={direction === "uplift"}
          />
          <ClientInput
            state={inputData}
            dispatch={inputDataDispatch}
            part="geometry"
            readOnly={direction === "uplift"}
          />
        </aside>
        <section className="analysis-preview" aria-label="Model preview">
          <ViewerCard
            state={inputData}
            loadDirection={direction}
            sectionCatalog={scope === "retrofit" ? "intelliframe" : "purlin"}
          />
        </section>
      </div>
    </div>
  );

  const renderMethodsPage = () => (
    <div className="analysis-workspace">
      {pageHeading(
        "Methods",
        "Analysis basis",
        "Load direction is fixed on each build tab. Gravity and uplift are set up separately."
      )}
      <Card className="surface-card">
        <div className="method-list">
          <div>
            <span>Load direction</span>
            <strong>{inputData.loadDirection === "uplift" ? "Uplift" : "Gravity"}</strong>
          </div>
          <div>
            <span>Existing cross section</span>
            <strong>{inputData.crossSection}</strong>
          </div>
          <div>
            <span>IntelliFrame section</span>
            <strong>{inputData.intelliFrameSection}</strong>
          </div>
          <div>
            <span>Deck</span>
            <strong>{inputData.deckType}</strong>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSummary = () => (
    <div className="summary-workspace">
      <div className="summary-heading">
        <div>
          <span className="section-kicker">Analysis output</span>
          <h1 className="page-title">Summary</h1>
          <p className="page-description">
            Choose a completed case to view its deflection, roof pressure, limit state, and failure location.
          </p>
        </div>
        {selectedRun && (
          <Tag
            icon={isStale ? <ExclamationCircleOutlined /> : <SafetyCertificateOutlined />}
            color={isStale ? "warning" : "success"}
          >
            {isStale ? "Out of date" : "Analysis complete"}
          </Tag>
        )}
      </div>

      {isStale && (
        <Alert
          className="stale-alert"
          type="warning"
          showIcon
          message="Inputs have changed since this analysis"
          description="The chart and results below reflect the previous inputs. Run the analysis again to bring them up to date."
          action={
            <Button size="small" onClick={() => setActiveTab(selectedRun?.key ?? "existing-gravity")}>
              Back to this case
            </Button>
          }
        />
      )}

      {completedRuns.length > 0 && runSwitch(completedRuns, selectedRun?.key, setSelectedRunKey)}
      <div id="summary-deflection">
        <DeflectionCard
          output={selectedRun ? runs[selectedRun.key] : null}
          title={selectedRun?.title}
        />
      </div>
      {selectedRun && (
        <ResultStats output={runs[selectedRun.key]} direction={selectedRun.direction} />
      )}
    </div>
  );

  const renderReport = () => (
    <div className="summary-workspace">
      <div className="summary-heading">
        <div>
          <span className="section-kicker">Issue package</span>
          <h1 className="page-title">Engineering report</h1>
          <p className="page-description">
            Choose a completed case to view and print its calculation package.
          </p>
        </div>
        {selectedReport && (
          <Tag
            icon={isReportStale ? <ExclamationCircleOutlined /> : <SafetyCertificateOutlined />}
            color={isReportStale ? "warning" : "success"}
          >
            {isReportStale ? "Out of date" : "Report ready"}
          </Tag>
        )}
      </div>
      {isReportStale && selectedReport && (
        <Alert
          className="stale-alert"
          type="warning"
          showIcon
          message="Inputs have changed since this report"
          description="The report still reflects the previous inputs. Run this case again before issuing it."
          action={
            <Button size="small" onClick={() => setActiveTab(selectedReport.key)}>
              Back to this case
            </Button>
          }
        />
      )}
      {reportRuns.length > 0 && runSwitch(reportRuns, selectedReport?.key, setSelectedReportKey)}
      <ReportViewNoSSR
        key={selectedReport?.key ?? "empty"}
        input={selectedReportInput}
        output={selectedReportOutput}
        title={selectedReport?.title}
      />
    </div>
  );

  const steps = [
    { key: "project", label: "Project", icon: FolderOpenOutlined, render: renderProjectPage },
    { key: "methods", label: "Methods", icon: ExperimentOutlined, render: renderMethodsPage },
    {
      key: "existing",
      label: "Existing Roof Analysis",
      icon: HomeOutlined,
      children: [
        { key: "existing-gravity", label: "Gravity Build", render: () => buildCasePage("existing", "gravity") },
        { key: "existing-uplift", label: "Uplift Build", render: () => buildCasePage("existing", "uplift") },
      ],
    },
    {
      key: "retrofit",
      label: "Retrofitted Roof Analysis",
      icon: SafetyCertificateOutlined,
      children: [
        { key: "retrofit-gravity", label: "Gravity Build", render: () => buildCasePage("retrofit", "gravity") },
        { key: "retrofit-uplift", label: "Uplift Build", render: () => buildCasePage("retrofit", "uplift") },
      ],
    },
    { key: "summary", label: "Summary", icon: BarChartOutlined, render: renderSummary },
    { key: "report", label: "Report", icon: FileTextOutlined, render: renderReport },
  ];
  const flatSteps = steps.flatMap((step) => step.children ?? [step]);
  const activeStep = flatSteps.find((step) => step.key === activeTab) ?? flatSteps[0];

  return (
    <>
      <Head>
        <title>IntelliFrame RF | IMETCO</title>
        <meta
          name="description"
          content="Purlin line capacity and deflection analysis"
        />
      </Head>
      <Layout align="top" flush>
        <div className="workspace-shell">
          <aside className="workflow-sidebar">
            <div className="workflow-sidebar-heading">
              <span>Design workflow</span>
            </div>
            <nav className="workflow-nav" aria-label="IntelliFrame RF workflow">
              {steps.map((step) => {
                const Icon = step.icon;
                const childSelected = step.children?.some((child) => child.key === activeTab);
                return (
                  <div key={step.key} className="workflow-group">
                    <button
                      type="button"
                      className={`workflow-item ${!step.children && activeTab === step.key ? "active" : ""} ${childSelected ? "parent-active" : ""}`}
                      aria-current={!step.children && activeTab === step.key ? "step" : undefined}
                      onClick={() => setActiveTab(step.children ? step.children[0].key : step.key)}
                    >
                      <Icon aria-hidden />
                      <span>{step.label}</span>
                    </button>
                    {step.children && (
                      <div className="workflow-subnav">
                        {step.children.map((child) => (
                          <button
                            key={child.key}
                            type="button"
                            className={`workflow-item workflow-subitem ${activeTab === child.key ? "active" : ""}`}
                            aria-current={activeTab === child.key ? "step" : undefined}
                            onClick={() => setActiveTab(child.key)}
                          >
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="workflow-sidebar-foot">
              <SafetyCertificateOutlined aria-hidden />
              <span>Guided IntelliFrame RF analysis</span>
            </div>
          </aside>
          <div className="workspace-main">
            <div className={`workspace-content${activeTab === "project" ? " workspace-content-project" : ""}`}>
              {activeStep.render()}
            </div>
            <Footer />
          </div>
        </div>
      </Layout>
    </>
  );
}
