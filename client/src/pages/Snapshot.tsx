import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { useCreateExperiment } from "@/hooks/use-experiments";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@shared/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Schema matching api input exactly
const formSchema = z.object({
  age: z.coerce.number().min(10).max(100),
  stressLevel: z.coerce.number().min(1).max(5),
  makeup: z.boolean(),
  sportFrequency: z.string().min(1, "Please select frequency"),
  menstrualCyclePhase: z.string().optional(),
  imageBase64: z.string().min(1, "Please upload a photo"),
});

export default function Snapshot() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { mutate, isPending } = useCreateExperiment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stressLevel: 3,
      makeup: false,
      age: 16,
      sportFrequency: "medium",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: (data) => {
        navigate(`/experiments/${data.id}/hypothesis`);
      },
      onError: () => {
        toast({
          title: "Error creating experiment",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Initial Snapshot</h1>
          <p className="text-muted-foreground">Let's establish your baseline before starting the experiment.</p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sportFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (0-1 days/week)</SelectItem>
                          <SelectItem value="medium">Medium (2-3 days/week)</SelectItem>
                          <SelectItem value="high">High (4+ days/week)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <span>Stress Level (1-5)</span>
                      <span className="text-primary font-bold">{field.value}</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Zen</span>
                      <span>Stressed</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="makeup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-white/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Daily Makeup</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="menstrualCyclePhase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle Phase (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="follicular">Follicular</SelectItem>
                          <SelectItem value="ovulation">Ovulation</SelectItem>
                          <SelectItem value="luteal">Luteal</SelectItem>
                          <SelectItem value="menstrual">Menstrual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageBase64"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Skin Photo</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        onImageSelected={(base64) => field.onChange(base64)}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Experiment...
                  </>
                ) : (
                  <>
                    Continue to Analysis
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </Form>
        </div>
      </motion.div>
    </Layout>
  );
}
