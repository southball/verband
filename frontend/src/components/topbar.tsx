import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/user-context";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export const Topbar = () => {
  const router = useRouter();
  const userContext = useUserContext();

  return (
    <div className="bg-background">
      <div className="flex py-1 px-4">
        <nav className={cn("flex items-center space-x-4 lg:space-x-6")}>
          <div className="text-md font-black transition-colors cursor-default">
            CTFNotes
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
              <Input placeholder="Search" />
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
