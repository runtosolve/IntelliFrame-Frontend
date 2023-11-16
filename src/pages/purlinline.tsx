import ClientInput from "@/components/client-input";
import usePurlinLine from "@/components/hooks/use-purlin-line";
import ResultsDisplay, { AnalaysisData, SAMPLE_RAW_DATA, processRawData } from "@/components/results/results-display";
import SubmitButton from "@/components/submission/submit-button";
import Image from "next/image";
import { useState } from "react";

const DEV_MODE = true;
const DEV_DATA = processRawData(SAMPLE_RAW_DATA);

export default function PurlinLine() {

  const [inputData, inputDataDispatch] = usePurlinLine();
  const [outputData, setOutputData] = useState<AnalaysisData | null>(!DEV_MODE ? (null) : (DEV_DATA)); 
  // Change to null when done debugging


  return (
    <>
      <header className="h-16 font-serif border-b-1 bg-white shadow-lg text-gray-900 flex items-center place-content-between space-x-6">
        <Image
          width={100} 
          height={100}
          src="/RunToSolveLogo.svg"
          alt="Logo"
          className="h-full w-auto py-2 px-6"
        />
        <div className="h-full px-16 text-md font-medium text-gray-700 flex items-center">
          PurlinLine Designer
        </div>
      </header>
      <main className="py-12 w-full bg-gray-100">
        <div className="flex justify-center">
          <ClientInput state={inputData} dispatch={inputDataDispatch}/>
        </div>
        {outputData && 
          <div className="flex justify-center">
            <ResultsDisplay data={outputData}/>
          </div>
        }
        <div className="pt-6 flex justify-center">
          <SubmitButton input={inputData} onUpdate={setOutputData}/>
        </div>
      </main>
      <footer
        className="bg-slate-950 border-t border-gray-100 text-gray-100 text-center"
      >
        <div className="py-6">
          &copy; 2023 RunToSolve, LLC. All rights reserved
        </div>
      </footer>
    </>
  )
}