import type { AppProps } from "next/app";
import "../globals.css";
import "katex/dist/katex.min.css";
import "../prism-vs.scss";
import "../prism-vsc-dark-plus.scss";
import { ThemeProvider } from "@/components/theme-provider";
import { UserContextProvider } from "@/contexts/user-context";
import { DefaultLayout } from "@/layouts/default";
import { DataContextProvider } from "@/contexts/data-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserContextProvider>
        <DataContextProvider>
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </DataContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  );
}
