import Layout from "@/components/layout/layout";
import RegisterForm from "@/components/user-auth/register-form";
import Head from "next/head";

export default function Registeration() {
  return (
    <>
      <Head>
        <title>Register | RunToSolve</title>
      </Head>
      <Layout>
        <RegisterForm/>
      </Layout>
    </>
  );
}