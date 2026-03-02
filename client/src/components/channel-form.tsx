import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@shared/routes";
import { Loader2, Plus, Trash2 } from "lucide-react";

const formSchema = api.channels.create.input.extend({
  serialNumber: z.coerce.number().min(0, "Must be at least 0"),
  urls: z.array(z.string().url("Must be a valid URL")).min(1, "At least one URL is required"),
  tvgId: z.string().optional().nullable(),
  tvgLogo: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  tvgGroup: z.string().optional().nullable(),
}).omit({ url: true });

type FormValues = z.infer<typeof formSchema>;

interface ChannelFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function ChannelForm({ 
  initialData, 
  onSubmit, 
  isPending = false,
  submitLabel = "Save Channel" 
}: ChannelFormProps) {
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      urls: initialData?.urls || [""],
      serialNumber: initialData?.serialNumber || 0,
      tvgId: initialData?.tvgId || "",
      tvgLogo: initialData?.tvgLogo || "",
      tvgGroup: initialData?.tvgGroup || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "urls" as any
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        urls: initialData.urls || [""],
        serialNumber: initialData.serialNumber || 0,
        tvgId: initialData.tvgId || "",
        tvgLogo: initialData.tvgLogo || "",
        tvgGroup: initialData.tvgGroup || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: FormValues) => {
    const cleanedValues = {
      ...values,
      tvgId: values.tvgId || null,
      tvgLogo: values.tvgLogo || null,
      tvgGroup: values.tvgGroup || null,
    };
    onSubmit(cleanedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Core Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. BBC One" {...field} className="font-sans" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tvgGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Group</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. News, Entertainment" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Stream URLs <span className="text-destructive">*</span></FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`urls.${index}` as any}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="http://example.com/stream.m3u8" 
                          className="font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => append("")}
            >
              <Plus className="h-4 w-4 mr-2" /> Add URL
            </Button>
          </div>
        </div>

        {/* Input for Serial Number */}
        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem className="bg-secondary/30 p-4 rounded-xl border border-border/50">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Order Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    className="w-24 text-right font-mono" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
              </div>
              <FormDescription className="mt-2">
                Must be unique. Determines playlist order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Advanced TVG Metadata */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Advanced EPG Data</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tvgId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TVG ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. bbc1.uk" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>Identifier for the EPG guide</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tvgLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TVG Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://.../logo.png" className="font-mono text-sm" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>Direct link to the channel icon</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
