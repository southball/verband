import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/user-context";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { FormEventHandler, useState } from "react";
import { useForm } from "react-hook-form";

export const Topbar = () => {
  const router = useRouter();
  const userContext = useUserContext();

  const [searchInput, setSearchInput] = useState("");
  const onSearch: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const searchURL = new URL(window.location.href);
    searchURL.pathname = "/search";
    for (const param of Array.from(searchURL.searchParams.keys()))
      searchURL.searchParams.delete(param);
    searchURL.searchParams.set("query", searchInput);
    router.push(searchURL.toString());
  };

  return (
    <div className="bg-background">
      <div className="flex py-1 px-4">
        <nav className={cn("flex items-center space-x-4 lg:space-x-6")}>
          <div className="text-md font-black transition-colors cursor-default">
            Verband
          </div>
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              { "text-muted-foreground": router.pathname !== "/" },
            )}
          >
            Home
          </Link>
        </nav>
        <div className="grow" />
        <nav className={cn("flex items-center space-x-4 lg:space-x-6")}>
          {userContext.user === null && (
            <>
              <Link
                href="/auth/register"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  {
                    "text-muted-foreground":
                      router.pathname !== "/auth/register",
                  },
                )}
              >
                Register
              </Link>
              <Link
                href="/auth/login"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  {
                    "text-muted-foreground": router.pathname !== "/auth/login",
                  },
                )}
              >
                Login
              </Link>
            </>
          )}
          {userContext.user !== null && userContext.user !== undefined ? (
            <>
              <form onSubmit={onSearch}>
                <Input
                  placeholder="Search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </form>
              <Link
                href="/auth/logout"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  {
                    "text-muted-foreground": router.pathname !== "/auth/login",
                  },
                )}
              >
                Logout
              </Link>
            </>
          ) : null}
        </nav>
        <div className="ml-4">
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </div>
  );
};
