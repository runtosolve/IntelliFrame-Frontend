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
  BuildOutlined,
  ExperimentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { mapStateToJSON } from "@/components/submission/submission-utils";

const ReportViewNoSSR = dynamic(() => import("@/components/report/report-view"), {
  ssr: false,
});

const DEV_MODE = false;

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
  const [runs, setRuns] = useState<Record<"gravity" | "uplift", AnalaysisData | null>>({
    gravity: !DEV_MODE ? null : DEV_DATA,
    uplift: null,
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
    !DEV_MODE ? null : mapStateToJSON(inputData)
  );

  const handleResult = (result: AnalaysisData | null, submittedInput?: string) => {
    const direction = activeTab.includes("uplift") ? "uplift" : "gravity";
    setRuns((current) => ({ ...current, [direction]: result }));
    setOutputData(result);
    setAnalyzedInput(result ? submittedInput ?? null : null);
  };

  useEffect(() => {
    const direction = activeTab === "existing-uplift"
      ? "uplift"
      : activeTab === "existing-gravity"
        ? "gravity"
        : null;
    if (direction && inputData.loadDirection !== direction) {
      inputDataDispatch({ type: "set", field: "loadDirection", payload: direction });
    }
  }, [activeTab, inputData.loadDirection, inputDataDispatch]);

  const isStale = outputData !== null && analyzedInput !== mapStateToJSON(inputData);

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

  const buildPage = (
    <div className="analysis-workspace">
      {pageHeading(
        "Build",
        "Section, geometry, and preview",
        "Set the purlin section and framing geometry. The preview updates as you edit."
      )}
      <div className="analysis-grid">
        <aside className="analysis-sidebar" aria-label="Purlin inputs">
          <ClientInput state={inputData} dispatch={inputDataDispatch} part="section" />
          <ClientInput state={inputData} dispatch={inputDataDispatch} part="geometry" />
        </aside>
        <section className="analysis-preview" aria-label="Model preview">
          <ViewerCard state={inputData} />
        </section>
      </div>
    </div>
  );

  const methodsPage = (
    <div className="analysis-workspace">
      {pageHeading(
        "Methods",
        "Analysis basis",
        "Load direction is set on Build. Existing roof runs each direction separately."
      )}
      <Card className="surface-card">
        <div className="method-list">
          <div>
            <span>Load direction</span>
            <strong>{inputData.loadDirection === "uplift" ? "Uplift" : "Gravity"}</strong>
          </div>
          <div>
            <span>Cross section</span>
            <strong>{inputData.crossSection}</strong>
          </div>
          <div>
            <span>Deck</span>
            <strong>{inputData.deckType}</strong>
          </div>
        </div>
      </Card>
    </div>
  );

  const directionResults = (direction: "gravity" | "uplift") => (
    <>
      <ResultStats output={runs[direction]} direction={direction} />
      <DeflectionCard output={runs[direction]} />
    </>
  );

  const existingPage = (direction: "gravity" | "uplift") => (
    <div className="analysis-workspace">
      {pageHeading(
        "Existing roof analysis",
        direction === "gravity" ? "Gravity" : "Uplift",
        `Run the existing roof for ${direction}. Inputs come from Build.`,
        <SubmitButton
          input={{ ...inputData, loadDirection: direction }}
          onUpdate={handleResult}
        />
      )}
      <Card className="surface-card">
        <div className="method-list">
          <div>
            <span>Cross section</span>
            <strong>{inputData.crossSection}</strong>
          </div>
          <div>
            <span>Deck</span>
            <strong>{inputData.deckType}</strong>
          </div>
          <div>
            <span>Spans</span>
            <strong>{inputData.spans.map((span) => span.value).join(", ")} ft</strong>
          </div>
          <div>
            <span>Lap length</span>
            <strong>{inputData.lapLength} ft</strong>
          </div>
          <div>
            <span>Spacing</span>
            <strong>{inputData.spacing} ft</strong>
          </div>
          <div>
            <span>Frame flange width</span>
            <strong>{inputData.frameFlangeWidth} in</strong>
          </div>
        </div>
        <Button type="link" onClick={() => setActiveTab("build")}>Edit on Build</Button>
      </Card>
      {directionResults(direction)}
    </div>
  );

  const retrofitPage = (direction: "gravity" | "uplift") => (
    <div className="summary-workspace">
      {pageHeading(
        "Retrofitted roof analysis",
        direction === "gravity" ? "Gravity" : "Uplift",
        "Allowable pressure, governing limit state, and deflection for this direction."
      )}
      {directionResults(direction)}
    </div>
  );

  const summary = (
    <div className="summary-workspace">
      <div className="summary-heading">
        <div>
          <span className="section-kicker">Analysis output</span>
          <h1 className="page-title">Summary</h1>
          <p className="page-description">
            Deflection profile for the latest run.
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
          description="The chart below reflects the previous inputs. Run the analysis again to bring it up to date."
          action={
            <Button size="small" onClick={() => setActiveTab("existing-gravity")}>
              Back to existing roof
            </Button>
          }
        />
      )}

      <DeflectionCard output={outputData} />
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
    { key: "build", label: "Build", icon: BuildOutlined, content: buildPage },
    { key: "methods", label: "Methods", icon: ExperimentOutlined, content: methodsPage },
    {
      key: "existing",
      label: "Existing Roof Analysis",
      icon: HomeOutlined,
      children: [
        { key: "existing-gravity", label: "Gravity", content: existingPage("gravity") },
        { key: "existing-uplift", label: "Uplift", content: existingPage("uplift") },
      ],
    },
    {
      key: "retrofit",
      label: "Retrofitted Roof Analysis",
      icon: SafetyCertificateOutlined,
      children: [
        { key: "retrofit-gravity", label: "Gravity", content: retrofitPage("gravity") },
        { key: "retrofit-uplift", label: "Uplift", content: retrofitPage("uplift") },
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
        <title>PurlinLine | IMETCO</title>
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
            <nav className="workflow-nav" aria-label="PurlinLine workflow">
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
              <span>Guided purlin line analysis</span>
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
