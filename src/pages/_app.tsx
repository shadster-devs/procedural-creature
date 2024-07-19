import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import CreatureConfigProvider from "@/contexts/CreatureConfigProvider";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <CreatureConfigProvider>
        <Component {...pageProps} />
      </CreatureConfigProvider>
  );
}
