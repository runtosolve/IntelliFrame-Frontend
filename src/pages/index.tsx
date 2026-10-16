import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine, { type PurLinLineState } from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import Footer from "@/components/layout/footer";
import { DeflectionCard, ResultStats, type AnalaysisData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Button, Card, Input, Tag } from "antd";
import {
  BarChartOutlined,
  BuildOutlined,
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

type AnalysisScope = "existing" | "retrofit";
type LoadDirection = "gravity" | "uplift";
type AnalysisRunKey = `${AnalysisScope}-${LoadDirection}`;

type AnalysisRun = { key: AnalysisRunKey; title: string; scope: AnalysisScope; direction: LoadDirection };

const RUNS: Record<AnalysisRunKey, AnalysisRun> = {
  "existing-gravity": { key: "existing-gravity", title: "Gravity - Existing roof analysis", scope: "existing", direction: "gravity" },
  "existing-uplift": { key: "existing-uplift", title: "Uplift - Existing roof analysis", scope: "existing", direction: "uplift" },
  "retrofit-gravity": { key: "retrofit-gravity", title: "Gravity - Retrofitted roof analysis", scope: "retrofit", direction: "gravity" },
  "retrofit-uplift": { key: "retrofit-uplift", title: "Uplift - Retrofitted roof analysis", scope: "retrofit", direction: "uplift" },
};

const ANALYSIS_RUNS = Object.values(RUNS);

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

function sectionCatalog(scope: AnalysisScope) {
  return scope === "retrofit" ? "intelliframe" : "purlin";
}

function isRunStale(
  runInput: PurLinLineState | null,
  current: PurLinLineState,
  direction: LoadDirection | undefined,
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
  const [selectedReportKey, setSelectedReportKey] = useState<AnalysisRunKey | null>(null);
  const [revealResults, setRevealResults] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const handleResult = (result: AnalaysisData | null, submittedInput?: PurLinLineState) => {
    const run = ANALYSIS_RUNS.find((item) => item.key === activeTab);
    if (!run) return;
    setRuns((current) => ({ ...current, [run.key]: result }));
    setRunInputs((current) => ({
      ...current,
      [run.key]: result
        ? { ...(submittedInput ?? inputData), loadDirection: run.direction }
        : null,
    }));
    if (result) {
      setSelectedReportKey(run.key);
      setRevealResults(true);
    }
  };

  useEffect(() => {
    if (!revealResults) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setRevealResults(false);
  }, [revealResults]);

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

  const reportRuns = ANALYSIS_RUNS.filter((run) => runs[run.key] && runInputs[run.key]);
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
    items: AnalysisRun[],
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

  const renderBuildPage = (scope: AnalysisScope) => (
    <div className="analysis-workspace">
      {scope === "existing"
        ? pageHeading(
          "Existing roof",
          "Build Existing Roof",
          "Set the existing purlin section and framing geometry. The gravity and uplift analyses use these values."
        )
        : pageHeading(
          "Retrofitted roof",
          "Build Retrofitted Roof",
          "Purlin section and framing geometry come from Build Existing Roof. Choose the IntelliFrame RF profile used by the retrofitted gravity and uplift analyses."
        )}
      <div className="analysis-grid">
        <aside className="analysis-sidebar" aria-label="Purlin inputs">
          <ClientInput
            state={inputData}
            dispatch={inputDataDispatch}
            part="section"
            retrofit={scope === "retrofit"}
          />
          <ClientInput
            state={inputData}
            dispatch={inputDataDispatch}
            part="geometry"
            retrofit={scope === "retrofit"}
          />
        </aside>
        <section className="analysis-preview" aria-label="Model preview">
          <ViewerCard
            state={inputData}
            sectionCatalog={sectionCatalog(scope)}
            showLoad={false}
          />
        </section>
      </div>
    </div>
  );

  const caseResults = (run: AnalysisRun) => {
    const output = runs[run.key];
    if (!output) return null;
    return (
      <section ref={resultsRef} className="case-results" aria-label="Analysis results">
        {isRunStale(runInputs[run.key], inputData, run.direction) && (
          <Alert
            className="stale-alert"
            type="warning"
            showIcon
            message="Inputs have changed since this analysis"
            description="The results below reflect the previous inputs. Run the analysis again to bring them up to date."
          />
        )}
        <DeflectionCard output={output} title={run.title} />
        <ResultStats output={output} direction={run.direction} />
      </section>
    );
  };

  const buildCasePage = (run: AnalysisRun) => (
    <div className="analysis-workspace">
      {pageHeading(
        run.scope === "existing" ? "Existing roof analysis" : "Retrofitted roof analysis",
        run.direction === "gravity" ? "Gravity Analysis" : "Uplift Analysis",
        `Purlin section and framing geometry already set in ${run.scope === "existing" ? "Build Existing Roof" : "Build Retrofitted Roof"}. Load direction is ${run.direction}, and the framing layout shows the load ${run.direction === "gravity" ? "downward" : "upward"}. Run analysis to get the result.`,
        <SubmitButton
          input={{ ...inputData, loadDirection: run.direction }}
          analysisType={run.scope}
          onUpdate={handleResult}
        />
      )}
      <section className="case-preview" aria-label="Model preview">
        <ViewerCard state={inputData} loadDirection={run.direction} sectionCatalog={sectionCatalog(run.scope)} />
      </section>
      {caseResults(run)}
    </div>
  );

  const renderMethodsPage = () => (
    <div className="analysis-workspace">
      {pageHeading(
        "Methods",
        "Analysis basis",
        "Load direction is fixed on each analysis tab. Gravity and uplift are run separately."
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

  const renderSummary = () => {
    const completed = ANALYSIS_RUNS.filter((run) => runs[run.key]).length;
    return (
      <div className="summary-workspace">
        <div className="summary-heading">
          <div>
            <span className="section-kicker">Analysis output</span>
            <h1 id="summary-title" className="page-title">Summary</h1>
            <p className="page-description">
              Allowable pressure, governing limit state, and failure location for each case that has been run.
            </p>
          </div>
          <Tag icon={<SafetyCertificateOutlined />} color={completed === ANALYSIS_RUNS.length ? "success" : "default"}>
            {completed} of {ANALYSIS_RUNS.length} complete
          </Tag>
        </div>
        <div className="summary-table-card">
          <table className="summary-table" aria-labelledby="summary-title">
            <thead>
              <tr>
                <th scope="col">Case</th>
                <th scope="col">Allowable roof pressure</th>
                <th scope="col">Predicted failure limit state</th>
                <th scope="col">Failure location</th>
              </tr>
            </thead>
            <tbody>
              {ANALYSIS_RUNS.map((run) => {
                const output = runs[run.key];
                const stale = isRunStale(runInputs[run.key], inputData, run.direction);
                return (
                  <tr key={run.key} className={output ? undefined : "is-pending"}>
                    <th scope="row">
                      <span className={`summary-case summary-case-${run.direction}`}>
                        {run.direction === "gravity" ? "Gravity" : "Uplift"}
                      </span>
                      <span className="summary-scope">
                        {run.scope === "existing" ? "Existing roof" : "Retrofitted roof"}
                      </span>
                      {stale && <span className="summary-stale">Inputs changed</span>}
                    </th>
                    <td>
                      {output ? (
                        <span className="summary-pressure">
                          {output.capacity.value}
                          <small>{output.capacity.unit}</small>
                        </span>
                      ) : <span className="summary-blank">—</span>}
                    </td>
                    <td className="summary-limit">
                      {output ? output.failureLimitState : <span className="summary-blank">Not run</span>}
                    </td>
                    <td>
                      {output ? (
                        <span className="summary-location">
                          {output.failureLocation.toLocaleString()}
                          <small>in</small>
                        </span>
                      ) : <span className="summary-blank">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
    { key: "build-existing", label: "Build Existing Roof", icon: BuildOutlined, render: () => renderBuildPage("existing") },
    {
      key: "existing",
      label: "Existing Roof Analysis",
      icon: HomeOutlined,
      children: [
        { key: "existing-gravity", label: "Gravity", render: () => buildCasePage(RUNS["existing-gravity"]) },
        { key: "existing-uplift", label: "Uplift", render: () => buildCasePage(RUNS["existing-uplift"]) },
      ],
    },
    { key: "build-retrofit", label: "Build Retrofitted Roof", icon: BuildOutlined, render: () => renderBuildPage("retrofit") },
    {
      key: "retrofit",
      label: "Retrofitted Roof Analysis",
      icon: SafetyCertificateOutlined,
      children: [
        { key: "retrofit-gravity", label: "Gravity", render: () => buildCasePage(RUNS["retrofit-gravity"]) },
        { key: "retrofit-uplift", label: "Uplift", render: () => buildCasePage(RUNS["retrofit-uplift"]) },
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
            <div className={`workspace-content${activeTab === "project" || activeTab === "report" ? " workspace-content-accent" : ""}`}>
              {activeStep.render()}
            </div>
            <Footer />
          </div>
        </div>
      </Layout>
    </>
  );
}
