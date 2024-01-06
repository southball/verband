import { Topbar } from "@/components/topbar";
import { useUserContext } from "@/contexts/user-context";
import { UserLogoutDocument } from "@/graphql";
import { urqlClient } from "@/graphql/urql";
import { DefaultLayout } from "@/layouts/default";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();
  const userContext = useUserContext();

  useEffect(() => {
    (async () => {
      await urqlClient.mutation(UserLogoutDocument, {}).toPromise();
      userContext.refresh();
      router.push("/");
    })();
  }, []);

  return <DefaultLayout />;
}
