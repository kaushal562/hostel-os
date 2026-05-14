import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, X } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  issueType: z.string({
    required_error: "Please select an issue type",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  location: z.string().min(2, {
    message: "Please specify the location",
  }),
  priority: z.string({
    required_error: "Please select a priority level",
  }),
});

type ComplaintFormValues = z.infer<typeof formSchema>;

interface ComplaintFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: ComplaintFormValues) => void;
}

const ComplaintForm = ({
  open = true,
  onOpenChange,
  onSubmit,
}: ComplaintFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueType: "",
      title: "",
      description: "",
      location: "",
      priority: "medium",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      // Create object URLs for selected images
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: ComplaintFormValues) => {
    setSubmitCount(prev => prev + 1);
    console.log(`[ComplaintForm] Submit handler execution count: ${submitCount + 1}`);

    try {
      setIsSubmitting(true);
      // Here you would typically upload the images and submit the form data
      console.log("Form values:", values);
      console.log("Images:", images);

      // Insert complaint into Supabase
      // SECURITY: user_id is derived via DB default auth.uid(); do not send user_id from frontend.
      const { data, error } = await supabase
        .from("complaints")
        .insert([
          {
            title: values.title,
            description: values.description,
            location: values.location,
            issue_type: values.issueType,
            priority: values.priority,
            status: "pending",
          },
        ])
        .select();

      console.log("[ComplaintForm] Supabase insert response:", { data, error });

      if (error) {
        console.error("Supabase insert complaint error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully. We will review it soon.",
      });

      if (onSubmit) {
        onSubmit(values);
      }


      // Clean up image URLs
      imageUrls.forEach(URL.revokeObjectURL);
      setImages([]);
      setImageUrls([]);
      form.reset();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,920px)] gap-6 overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className="border-0 pb-0">
          <DialogTitle>Submit a complaint</DialogTitle>
          <DialogDescription>
            Precision helps resolution—share location, severity, and anything visible on the ground.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief title of your complaint"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Where is the issue located?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Supporting images</FormLabel>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-cyan-500/35 hover:bg-white/[0.05]">
                    <ImagePlus className="h-8 w-8 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {imageUrls.map((url, index) => (
                  <div key={index} className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={url}
                      alt={`Uploaded image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-600/90 p-1 text-white shadow-lg transition hover:bg-red-500"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <FormDescription>
                Upload images to help us better understand the issue (optional).
              </FormDescription>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange && onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit complaint"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintForm;
