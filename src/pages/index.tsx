import ClientInput from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import Layout from "@/components/layout/layout";
import ResultsDisplay, { AnalaysisData, SAMPLE_RAW_DATA, processRawData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Head from "next/head";
import { useState } from "react";
import { useAuth } from "react-oidc-context";

const DEV_MODE = false;

export default function Home() {
  const auth = useAuth();
  const [inputData, inputDataDispatch] = usePurlinLine();
  const DEV_DATA = processRawData(inputData, SAMPLE_RAW_DATA);
  const [outputData, setOutputData] = useState<AnalaysisData | null>(!DEV_MODE ? null : DEV_DATA);

  if (auth.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  return (
    <>
      <Head>
        <title>PurlinLine | RunToSolve</title>
      </Head>
      <Layout>
        <ClientInput state={inputData} dispatch={inputDataDispatch} />
        {outputData && <ResultsDisplay output={outputData} />}
        <div className="pt-6 flex justify-center">
          <SubmitButton input={inputData} onUpdate={setOutputData} accessToken={auth.user?.access_token ?? ""} />
        </div>
      </Layout>
    </>
  );
}
