import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
  preferredRoomType: z.string({
    required_error: "Please select a preferred room type.",
  }),
  preferredFloor: z.string().optional(),
  roommatePreference: z.string().optional(),
  additionalNotes: z.string().optional(),
});

interface RoomChangeFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
}

const RoomChangeForm = ({
  open = true,
  onOpenChange,
  onSubmit,
}: RoomChangeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      preferredRoomType: "",
      preferredFloor: "",
      roommatePreference: "",
      additionalNotes: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);


    try {
      // Get current user - using getUser() for better security as recommended by Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          userError?.message || "User not authenticated. Please log in again."
        );
      }

      console.log("Current user:", user);

      // Validate that we have a valid UUID
      if (!user.id || user.id.trim() === "") {
        throw new Error("Invalid user ID. Please log in again.");
      }

      // Optional debug: auth session
      const session = (await supabase.auth.getSession()).data.session;
      console.log("Auth session exists?", !!session, "session user?", session?.user?.id);

      // Prepare the data - ensure all fields match the database schema exactly
      // SECURITY: do NOT send user_id from the frontend.
      // user_id is derived/checked by Supabase using auth.uid() + RLS.
      const requestData = {
        reason: values.reason.trim(),
        preferred_room_type: values.preferredRoomType,
        preferred_floor: values.preferredFloor || null,
        roommate_preference: values.roommatePreference?.trim() || null,
        additional_notes: values.additionalNotes?.trim() || null,
        status: "pending",
      };

      console.log("Submitting room change request payload:", requestData);

      // Insert room change request into Supabase
      console.log("Using supabase client auth? (should be authenticated)");
      const { data, error } = await supabase
        .from("room_change_requests")
        .insert([requestData])
        .select();

      console.log("Insert result data:", data);
      console.log("Insert result error:", error);

      if (error) {
        console.error("Supabase error:", error);
        // Provide more detailed error messages based on error code
        let errorMessage = "Failed to submit room change request. ";
        if (error.code === "42501") {
          errorMessage +=
            "You don't have permission to submit this request. Please ensure you're logged in.";
        } else if (error.code === "23502") {
          errorMessage +=
            "Missing required fields. Please fill in all mandatory fields.";
        } else if (error.code === "23503") {
          errorMessage +=
            "Invalid user reference. Please try logging in again.";
        } else {
          errorMessage += error.message || "Please try again.";
        }
        throw new Error(errorMessage);
      }

      console.log("Room change request submitted successfully:", data);

      // Show success toast
      toast({
        title: "Success",
        description:
          "Your room change request has been submitted successfully. We'll review it and get back to you soon.",
      });

      // Reset form
      form.reset();

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(values);
      }

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting room change request:", error);
      // Show error toast
      toast({
        title: "Error",
        description:
          error?.message ||
          "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,880px)] gap-6 overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className="border-0 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-cyan-300">
              <Building className="h-5 w-5" strokeWidth={1.75} />
            </span>
            Request room change
          </DialogTitle>
          <DialogDescription>
            Tell us what you need—we route every request through the same operational ledger as admin workflows.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Change*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you are requesting a room change..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation for your request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredRoomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Room Type*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single Room</SelectItem>
                        <SelectItem value="double">Double Room</SelectItem>
                        <SelectItem value="triple">Triple Room</SelectItem>
                        <SelectItem value="quad">Quad Room</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredFloor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Floor (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ground">Ground Floor</SelectItem>
                        <SelectItem value="first">First Floor</SelectItem>
                        <SelectItem value="second">Second Floor</SelectItem>
                        <SelectItem value="third">Third Floor</SelectItem>
                        <SelectItem value="fourth">Fourth Floor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roommatePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roommate Preference (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter names of preferred roommates if any..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll try to accommodate your preferences if possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other information you'd like us to consider..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange && onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomChangeForm;
