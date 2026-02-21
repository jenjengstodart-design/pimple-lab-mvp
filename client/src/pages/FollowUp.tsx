import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { useFollowUpExperiment, useExperiment } from "@/hooks/use-experiments";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Form,
  FormControl,
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  imageBase64: z.string().min(1, "Please upload a final photo"),
  outcome: z.string().min(1, "Please select an outcome"),
});

export default function FollowUp() {
  const [match, params] = useRoute("/experiments/:id/follow-up");
  const [, navigate] = useLocation();
  const id = Number(params?.id);
  const { toast } = useToast();
  
  const { mutate, isPending } = useFollowUpExperiment();
  const { data: experiment } = useExperiment(id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate({
      id,
      ...values
    }, {
      onSuccess: (data) => {
        navigate(`/experiments/${data.id}/results`);
      },
      onError: () => {
        toast({
          title: "Error submitting",
          variant: "destructive",
        });
      }
    });
  };

  if (!experiment) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Final Results</h1>
          <p className="text-muted-foreground">Let's see how your skin has changed.</p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Initial Photo</span>
                  <div className="rounded-xl overflow-hidden h-48 bg-black/5 border">
                    <img src={experiment.initialImageUrl} alt="Initial" className="w-full h-full object-cover opacity-70" />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="imageBase64"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Photo</FormLabel>
                      <FormControl>
                        <ImageUpload 
                          onImageSelected={(base64) => field.onChange(base64)}
                          className="h-48"
                          label="Upload After Photo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Assessment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg bg-white/50">
                          <SelectValue placeholder="How is your skin?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="better">Better - Visible Improvement</SelectItem>
                        <SelectItem value="same">Same - No Major Change</SelectItem>
                        <SelectItem value="worse">Worse - Irritation or Breakouts</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="animate-spin" /> : (
                  <>
                    Generate Final Report
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
