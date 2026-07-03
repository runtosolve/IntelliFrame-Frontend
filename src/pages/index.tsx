import Link from "next/link";
import Layout from "@/components/layout/layout";
import Head from 'next/head'
import { Button, Card } from "antd";
import { ArrowRightOutlined, GithubOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <>
      <Head>
        <title>RunToSolve</title>
      </Head>
      <Layout>
        <div className="max-w-3xl text-center">
          <h1 className="font-bold text-8xl mb-4">
            Get the <span className="bg-clip-text text-transparent bg-gradient-to-l from-green-300 via-blue-500 to-purple-600">answer</span>.
          </h1>
        </div>
        <div className="mt-12 max-w-3xl flex flex-wrap gap-6 justify-center px-4">
          <Card title="Data-driven" className="basis-72 grow shadow-sm" hoverable>
            <p className="text-gray-600">
              Strength prediction, optimization, and design of cold-formed steel using data-driven models which are based on existing physcial testing data
            </p>
            <Link href="https://crismoen.quarto.pub/cold-formed-steel-framing-design-with-data-driven-models/#/title-slide">
              <Button className="mt-4" icon={<ArrowRightOutlined />}>
                See latest models
              </Button>
            </Link>
          </Card>
          <Card title="Simulations" className="basis-72 grow shadow-sm" hoverable>
            <p className="text-gray-600">
              Nonlinear finite element simulation of steel structural systems using Abaqus and LS-DYNA
            </p>
          </Card>
          <Card title="Software" className="basis-72 grow shadow-sm" hoverable>
            <p className="text-gray-600">
              Develop specialized structural engineering software as standalone web applications or integrate into your existing solutions
            </p>
            <Link href="/purlinline">
              <Button className="mt-4" type="primary" icon={<ArrowRightOutlined />}>
                Go to PurlinLine.jl
              </Button>
            </Link>
          </Card>
          <Card title="Open-source" className="basis-72 grow shadow-sm" hoverable>
            <p className="text-gray-600">
              Various open-source structural engineering software packages developed by our team in C#, julia and Typescript
            </p>
            <Link href="https://github.com/runtosolve">
              <Button className="mt-4" icon={<GithubOutlined />}>
                Go to GitHub repos
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    </>
  )
}
