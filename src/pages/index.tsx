import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import Footer from "@/components/layout/footer";
import { DeflectionCard, ResultStats, AnalaysisData, SAMPLE_RAW_DATA, processRawData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
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

const DEV_MODE = false;

type AnalysisRunKey = "existing-gravity" | "existing-uplift" | "retrofit-gravity" | "retrofit-uplift";

const SUMMARY_RUNS: Array<{ key: AnalysisRunKey; title: string; direction: "gravity" | "uplift" }> = [
  { key: "existing-gravity", title: "Gravity - Existing roof analysis", direction: "gravity" },
  { key: "existing-uplift", title: "Uplift - Existing roof analysis", direction: "uplift" },
  { key: "retrofit-gravity", title: "Gravity - Retrofitted roof analysis", direction: "gravity" },
  { key: "retrofit-uplift", title: "Uplift - Retrofitted roof analysis", direction: "uplift" },
];

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

export default function Home() {
  const [inputData, inputDataDispatch] = usePurlinLine();
  const DEV_DATA = processRawData(inputData, SAMPLE_RAW_DATA);
  const [outputData, setOutputData] = useState<AnalaysisData | null>(!DEV_MODE ? null : DEV_DATA);
  const [runs, setRuns] = useState<Record<AnalysisRunKey, AnalaysisData | null>>({
    "existing-gravity": !DEV_MODE ? null : DEV_DATA,
    "existing-uplift": null,
    "retrofit-gravity": null,
    "retrofit-uplift": null,
  });
  const [activeTab, setActiveTab] = useState("project");
  const [project, setProject] = useState<ProjectInfo>({
    projectName: "",
    projectLocation: "",
    projectReference: "",
    clientName: "",
    revisionNo: "",
  });
  const [analyzedInput, setAnalyzedInput] = useState<string | null>(
    !DEV_MODE ? null : mapGeometryToJSON(inputData)
  );
  const [selectedRunKey, setSelectedRunKey] = useState<AnalysisRunKey | null>(
    !DEV_MODE ? null : "existing-gravity"
  );

  const handleResult = (result: AnalaysisData | null, submittedInput?: string) => {
    const runKey = SUMMARY_RUNS.find((run) => run.key === activeTab)?.key;
    if (runKey) {
      setRuns((current) => ({ ...current, [runKey]: result }));
      if (result) setSelectedRunKey(runKey);
    }
    setOutputData(result);
    setAnalyzedInput(result ? submittedInput ?? mapGeometryToJSON(inputData) : null);
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

  const isStale = outputData !== null && analyzedInput !== mapGeometryToJSON(inputData);
  const completedRuns = SUMMARY_RUNS.filter((run) => runs[run.key]);
  const selectedRun = completedRuns.find((run) => run.key === selectedRunKey)
    ?? completedRuns[completedRuns.length - 1]
    ?? null;

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

  const projectPage = (
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
          ? "Set the purlin section and framing geometry. Load direction is gravity, and the framing layout shows the load downward."
          : "Set the purlin section and framing geometry. Load direction is uplift, and the framing layout shows the load upward.",
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
          />
          <ClientInput state={inputData} dispatch={inputDataDispatch} part="geometry" />
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

  const methodsPage = (
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

  const summary = (
    <div className="summary-workspace">
      <div className="summary-heading">
        <div>
          <span className="section-kicker">Analysis output</span>
          <h1 className="page-title">Summary</h1>
          <p className="page-description">
            Choose a completed case to view its deflection, roof pressure, limit state, and failure location.
          </p>
        </div>
        {outputData && (
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
            <Button size="small" onClick={() => setActiveTab("existing-gravity")}>
              Back to existing roof
            </Button>
          }
        />
      )}

      {completedRuns.length > 0 && (
        <div className="summary-chart-switch" role="radiogroup" aria-label="Analysis case">
          {completedRuns.map((run) => {
            const selected = selectedRun?.key === run.key;
            return (
              <button
                key={run.key}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "active" : ""}
                onClick={() => setSelectedRunKey(run.key)}
              >
                {run.title}
              </button>
            );
          })}
        </div>
      )}
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

  const report = (
    <div className="summary-workspace">
      <div className="summary-heading">
        <div>
          <span className="section-kicker">Issue package</span>
          <h1 className="page-title">Engineering report</h1>
          <p className="page-description">
            Printable calculation package for the latest run.
          </p>
        </div>
      </div>
      {isStale && (
        <Alert
          className="stale-alert"
          type="warning"
          showIcon
          message="Inputs have changed since this report"
          description="The report still reflects the previous inputs. Run the analysis again before issuing it."
          action={
            <Button size="small" onClick={() => setActiveTab("existing-gravity")}>
              Back to existing roof
            </Button>
          }
        />
      )}
      <ReportViewNoSSR input={inputData} output={outputData} />
    </div>
  );

  const steps = [
    { key: "project", label: "Project", icon: FolderOpenOutlined, content: projectPage },
    { key: "methods", label: "Methods", icon: ExperimentOutlined, content: methodsPage },
    {
      key: "existing",
      label: "Existing Roof Analysis",
      icon: HomeOutlined,
      children: [
        { key: "existing-gravity", label: "Gravity Build", content: buildCasePage("existing", "gravity") },
        { key: "existing-uplift", label: "Uplift Build", content: buildCasePage("existing", "uplift") },
      ],
    },
    {
      key: "retrofit",
      label: "Retrofitted Roof Analysis",
      icon: SafetyCertificateOutlined,
      children: [
        { key: "retrofit-gravity", label: "Gravity Build", content: buildCasePage("retrofit", "gravity") },
        { key: "retrofit-uplift", label: "Uplift Build", content: buildCasePage("retrofit", "uplift") },
      ],
    },
    { key: "summary", label: "Summary", icon: BarChartOutlined, content: summary },
    { key: "report", label: "Report", icon: FileTextOutlined, content: report },
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
              {activeStep.content}
            </div>
            <Footer />
          </div>
        </div>
      </Layout>
    </>
  );
}
