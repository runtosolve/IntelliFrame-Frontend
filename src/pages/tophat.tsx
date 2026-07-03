import ClientInput, { ViewerCard } from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import Footer from "@/components/layout/footer";
import Layout from "@/components/layout/layout";
import ResultsDisplay, { AnalaysisData, SAMPLE_RAW_DATA, processRawData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import { useState } from "react";

const DEV_MODE = false;

export default function TopHat() {


  const [inputData, inputDataDispatch] = usePurlinLine();
  const DEV_DATA = processRawData(inputData, SAMPLE_RAW_DATA);
  const [outputData, setOutputData] = useState<AnalaysisData | null>(!DEV_MODE ? (null) : (DEV_DATA));
  // Change to null when done debugging

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
              <ClientInput state={inputData} dispatch={inputDataDispatch} />
            </div>
            <div className="flex-1 w-full min-w-0 space-y-6">
              <ViewerCard state={inputData} />
              {outputData &&
                <ResultsDisplay output={outputData} />
              }
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}