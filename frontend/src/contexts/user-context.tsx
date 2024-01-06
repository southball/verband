import { UserMeDocument, UserMeQuery } from "@/graphql";
import { urqlClient } from "@/graphql/urql";
import React, { useContext, useEffect, useState } from "react";

type UserContextType = {
  /**
   * User currently logged in. Null if not logged in, undefined if fetching.
   */
  user: UserMeQuery["userMe"];
  refresh: () => unknown;
};

const UserContext = React.createContext<UserContextType>({
  user: undefined,
  refresh: () => {
    throw new Error("Not implemented!");
  },
});

export const useUserContext = () => useContext(UserContext);

export const UserContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<UserMeQuery["userMe"] | null | undefined>(
    undefined,
  );

  const refresh = async () => {
    setUser(undefined);
    const response = await urqlClient.query(UserMeDocument, {}).toPromise();
    if (response.data) {
      setUser(response.data.userMe);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
