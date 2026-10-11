import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import { DeflectionCard, ResultStats, type AnalaysisData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import { useState } from "react";

export default function TopHat() {
  const [inputData, inputDataDispatch] = usePurlinLine();
  const [outputData, setOutputData] = useState<AnalaysisData | null>(null);

  return (
    <>
      <Head>
        <title>TopHat | RunToSolve</title>
      </Head>
      <Layout align="top">
        <div className="w-full max-w-screen-2xl px-4 lg:px-6 space-y-6">
          <SubmitButton input={inputData} onUpdate={setOutputData} />
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6">
              <ClientInput state={inputData} dispatch={inputDataDispatch} part="section" />
              <ClientInput state={inputData} dispatch={inputDataDispatch} part="geometry" />
              <ResultStats output={outputData} />
            </div>
            <div className="flex-1 w-full min-w-0 space-y-6">
              <ViewerCard state={inputData} />
              <DeflectionCard output={outputData} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
