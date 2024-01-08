import MultipleSelector from "@/components/ui-expansions/multiple-selector";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import React from "react";
import { useForm } from "react-hook-form";

export const PostCreator: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const form = useForm();

  return (
    <Drawer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create Post</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="BabyWAF" {...field} />
                      </FormControl>
                      <FormDescription>Title of the post.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="tags"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          options={[{ label: "SECCON", value: "SECCON" }]}
                          placeholder="Select tags..."
                        />
                      </FormControl>
                      <FormDescription>Tags for the post.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DrawerFooter>
            <Button>Create</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
