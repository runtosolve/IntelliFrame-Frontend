import Link from "next/link";
import Layout from "@/components/layout/layout";

export default function Home() {
  return (
    <>
    <Layout>
      <div className="max-w-3xl text-center">
        <h1 className="font-bold text-8xl mb-4">
          Get the <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400">answer</span>
        </h1>
        {/* <p className="text-lg text-gray-600 mx-auto">
          We are a team of structural engineers, PhDs and software developers solving problems in unconventional ways
        </p> */}
        <div className="mt-6 flex justify-center">
          <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
          <button className="btn btn-neutral rounded-lg">Contact us</button>
        </Link>
        </div>
      </div>
      <div className="mt-12 max-w-3xl flex flex-wrap gap-6 justify-center">
        <div className="basis-72 card card-bordered card-compact">
          <div className="card-body">
            <h4 className="card-title">Data-driven models</h4>
            <p>
              Strength prediction, optimization, and design of cold-formed steel using data-driven models which are based on existing physcial testing data
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
            <div className="mt-4 card-actions">
              <button className="btn btn-outline rounded-lg">
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
            <div className="mt-4 card-actions">
              <button className="btn btn-outline rounded-lg">
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
