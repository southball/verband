import type { AppProps } from "next/app";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserContextProvider } from "@/contexts/user-context";
import { DefaultLayout } from "@/layouts/default";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserContextProvider>
        <DefaultLayout>
          <Component {...pageProps} />
        </DefaultLayout>
      </UserContextProvider>
    </ThemeProvider>
  );
}
