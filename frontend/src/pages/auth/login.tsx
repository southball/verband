import { ThemeToggle } from "@/components/theme-toggle";
import { Topbar } from "@/components/topbar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUserContext } from "@/contexts/user-context";
import { UserLoginDocument, UserRegisterDocument } from "@/graphql";
import { urqlClient } from "@/graphql/urql";
import { DefaultLayout } from "@/layouts/default";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  handleName: z.string(),
  password: z.string(),
});

export default function Login() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { handleName: "", password: "" },
  });
  const userContext = useUserContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    const response = await urqlClient
      .mutation(UserLoginDocument, {
        handleName: values.handleName,
        password: values.password,
      })
      .toPromise();
    if (response.error) {
      setErrorMessage(
        response.error.graphQLErrors?.[0].message ?? response.error.message,
      );
    } else {
      setErrorMessage(null);
      userContext.refresh();
      router.push("/");
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-[800px] mx-auto px-4 pt-4 space-y-6">
        <h3 className="text-lg font-medium">Login</h3>
        <Separator />
        {errorMessage !== null && (
          <Alert variant="destructive">{errorMessage}</Alert>
        )}
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onLogin)}>
            <FormField
              name="handleName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="southball" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Login</Button>
          </form>
        </Form>
      </div>
    </DefaultLayout>
  );
}
