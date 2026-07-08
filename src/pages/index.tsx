import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import { DeflectionCard, ResultStats, AnalaysisData, SAMPLE_RAW_DATA, processRawData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Tabs } from "antd";

const ReportViewNoSSR = dynamic(() => import("@/components/report/report-view"), {
  ssr: false,
});

const DEV_MODE = false;

export default function Home() {
  const [inputData, inputDataDispatch] = usePurlinLine();
  const DEV_DATA = processRawData(inputData, SAMPLE_RAW_DATA);
  const [outputData, setOutputData] = useState<AnalaysisData | null>(!DEV_MODE ? null : DEV_DATA);

  const calculator = (
    <div className="space-y-6">
      <SubmitButton input={inputData} onUpdate={setOutputData} />
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6">
          <ClientInput state={inputData} dispatch={inputDataDispatch} />
          <ResultStats output={outputData} />
        </div>
        <div className="flex-1 w-full min-w-0 space-y-6">
          <ViewerCard state={inputData} />
          <DeflectionCard output={outputData} />
        </div>
      </div>
    </div>
  );

  const items = [
    { key: "calculator", label: "Calculator", children: calculator },
    {
      key: "report",
      label: "Report",
      children: <ReportViewNoSSR input={inputData} output={outputData} />,
    },
  ];

  return (
    <>
      <Head>
        <title>PurlinLine | RunToSolve</title>
      </Head>
      <Layout align="top">
        <div className="w-full max-w-screen-2xl px-4 lg:px-6">
          <Tabs defaultActiveKey="calculator" items={items} />
        </div>
      </Layout>
    </>
  );
}
