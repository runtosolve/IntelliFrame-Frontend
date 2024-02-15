import ClientInput from "@/components/client-input";
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
      <Layout>
        <ClientInput state={inputData} dispatch={inputDataDispatch} />
        {outputData &&
          <ResultsDisplay output={outputData} />
        }
        <div className="pt-6 flex justify-center">
          <SubmitButton input={inputData} onUpdate={setOutputData} />
        </div>
      </Layout>
    </>
  )
}