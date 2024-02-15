import Layout from "@/components/layout/layout";
import LoginForm from "@/components/user-auth/login-form";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login | RunToSolve</title>
      </Head>
      <Layout>
        <LoginForm />
      </Layout>
    </>
  );
}