import Link from "next/link";
import Layout from "@/components/layout/layout";

export default function Home() {
  return (
    <>
    <Layout>
      <div className="max-w-3xl text-center">
        <h1 className="font-bold text-8xl mb-4">
          Get the <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400">answers</span>
        </h1>
        <p className="text-lg text-gray-600 mx-auto">
          We are a team of structural engineers, PhDs and software developers solving problems in unconventional ways
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="mailto:cris.moen@runtosolve.com">
          <button className="btn btn-neutral">Contact us</button>
        </Link>
        </div>
      </div>
      <div className="mt-12 max-w-3xl flex flex-wrap gap-6 justify-center">
        <div className="basis-72 card card-bordered card-compact">
          <div className="card-body">
            <h4 className="card-title">Cold-formed steel</h4>
            <p>
              Strength prediction, topology optimization, and design of cold-formed steel using finite analysis and Direct Strength Method (DSM) by AISI S100
            </p>
          </div>
        </div>
        <div className="basis-72 card card-bordered card-compact">
          <div className="card-body">
            <h4 className="card-title">Numerical simulation</h4>
            <p>
              Nonlinear finite element simulation of steel structural systems using Abaqus and LS-DYNA
            </p>
          </div>
        </div>
        <div className="basis-72 card card-bordered card-compact">
          <div className="card-body">
            <h4 className="card-title">Software development</h4>
            <p>
              Develop specialized structural engineering software as standalone web applications or integrate into your existing solutions
            </p>
            <div className="mt-4 card-actions grid justify-center">
              <button className="btn btn-outline">
                <Link href="/purlinline">
                  Go to PurlinLine.jl
                </Link>
              </button>
            </div>
          </div>
        </div>
        <div className="basis-72 card card-bordered card-compact">
          <div className="card-body">
            <h4 className="card-title">Open-source software</h4>
            <p>
              Various open-source structural engineering software packages developed by our team in C#, julia and Typescript
            </p>
            <div className="mt-4 card-actions grid justify-center">
              <button className="btn btn-outline">
                <Link href="https://github.com/runtosolve">
                  Go to GitHub repos
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  )
}
