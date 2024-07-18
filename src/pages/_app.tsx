import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import CreatureStateProvider from "@/contexts/CreatureStateProvider";

export default function App({ Component, pageProps }: AppProps) {
  return(
      <CreatureStateProvider>
        <Component {...pageProps} />
      </CreatureStateProvider>
  );
}
