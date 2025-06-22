"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addHours } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react";
import { CreateRoomSchema } from "@/lib/schemas";
import { createRoom } from "../actions/create-room";
import { cn2 } from "@/lib/utils";

// Explicitly define the form type
type FormData = z.infer<typeof CreateRoomSchema>;

export function CreateRoomForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ value: "" }, { value: "" }],
      votingDeadline: addHours(new Date(), 1),
      settings: {
        allowGuestVoting: true,
        allowDiscussion: true,
        allowVoteJustification: true,
        showLiveResults: true
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  async function onSubmit(values: FormData) {
  try {
    // Pass the values directly without transformation
    const response = await createRoom(values);
    
    if (response.success) {
      window.location.href = response.room.shareableUrl;
    }
  } catch (error) {
    console.error("Submission error:", error);
  }
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control as Control<FormData>}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision Title</FormLabel>
              <FormControl>
                <Input placeholder="What are we deciding?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control as Control<FormData>}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain the decision context..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Voting Options */}
        <div>
          <FormLabel>Voting Options</FormLabel>
          <div className="space-y-3 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control as Control<FormData>}
                  name={`options.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder={`Option ${index + 1}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {fields.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            )}
          </div>
        </div>

        {/* Deadline Field */}
        <FormField
          control={form.control as Control<FormData>}
          name="votingDeadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Voting Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn2(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(field.value, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(field.value);
                        newDate.setHours(parseInt(hours));
                        newDate.setMinutes(parseInt(minutes));
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Settings */}
        <div className="space-y-4">
          <FormLabel>Room Settings</FormLabel>
          
          <FormField
            control={form.control as Control<FormData>}
            name="settings.allowGuestVoting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Guest Voting</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable unauthenticated users to vote
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as Control<FormData>}
            name="settings.allowDiscussion"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Discussion</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Allow comments and conversations
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as Control<FormData>}
            name="settings.allowVoteJustification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Vote Explanations</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Let voters explain their choices
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as Control<FormData>}
            name="settings.showLiveResults"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Show Live Results</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Display real-time vote counts to room creator
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

       {
  form.formState.isSubmitting ? (
    <Button disabled size="lg" className="w-full">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Creating Room
    </Button>
  ) : (
    <Button 
      type="submit" 
      size="lg" 
      className="w-full"
    >
      Create Decision Room
    </Button>
  )
}
      </form>
    </Form>
  );
}