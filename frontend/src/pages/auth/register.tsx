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
import { UserRegisterDocument, UserRegisterDocument } from "@/graphql";
import { urqlClient } from "@/graphql/urql";
import { DefaultLayout } from "@/layouts/default";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerFormSchema = z.object({
  handleName: z.string().min(3),
  displayName: z.string().min(1),
  password: z.string().min(8),
});

export default function Register() {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { handleName: "", password: "" },
  });
  const userContext = useUserContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onRegister = async (values: z.infer<typeof registerFormSchema>) => {
    const response = await urqlClient
      .mutation(UserRegisterDocument, {
        handleName: values.handleName,
        displayName: values.displayName,
        password: values.password,
      })
      .toPromise();
    if (response.error) {
      setErrorMessage("Wrong username or password.");
    } else {
      setErrorMessage(null);
      userContext.refresh();
      router.push("/");
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 pt-4 space-y-6">
      <h3 className="text-lg font-medium mb-6">Register</h3>
      <Separator />
      {errorMessage !== null && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onRegister)}>
          <FormField
            name="handleName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle Name</FormLabel>
                <FormControl>
                  <Input placeholder="southball" {...field} />
                </FormControl>
                <FormDescription>
                  This is the handle name used for login.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="displayName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Southball" {...field} />
                </FormControl>
                <FormDescription>
                  This is the display name shown to other users.
                </FormDescription>
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
                <FormDescription>
                  This is required for logging in.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Register</Button>
        </form>
      </Form>
    </div>
  );
}
