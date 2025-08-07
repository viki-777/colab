import "../common/styles/global.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react";

import ModalManager from "@/common/components/modal/components/ModalManager";
import { AuthProvider } from "@/common/context/Auth.context";
import { ThemeProvider } from "@/common/context/Theme.context";

import "react-toastify/dist/ReactToastify.min.css";

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AuthProvider>
          <Head>
            <title>Collabio</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <RecoilRoot>
            <ToastContainer />
            <ModalManager />
            <Component {...pageProps} />
          </RecoilRoot>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default App;
