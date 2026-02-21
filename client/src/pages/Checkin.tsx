import { useRoute, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { useExperiment, useCheckins, useAddCheckin } from "@/hooks/use-experiments";
import { Loader2, Check, CalendarDays, ArrowRight, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const checkinSchema = z.object({
  adherence: z.coerce.number().min(0).max(100),
  stressLevel: z.coerce.number().min(1).max(5),
  makeup: z.boolean(),
});

export default function Checkin() {
  const [match, params] = useRoute("/experiments/:id/checkin");
  const [, navigate] = useLocation();
  const id = Number(params?.id);
  
  const { data: experiment, isLoading: loadingExp } = useExperiment(id);
  const { data: checkins, isLoading: loadingCheckins } = useCheckins(id);
  const { mutate: addCheckin, isPending } = useAddCheckin();

  const form = useForm<z.infer<typeof checkinSchema>>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      adherence: 80,
      stressLevel: 3,
      makeup: false,
    },
  });

  if (loadingExp || loadingCheckins || !experiment) return null;

  const nextDayNumber = (checkins?.length || 0) + 1;
  const isComplete = nextDayNumber > (experiment.durationDays || 7);

  // Auto-redirect if experiment is done
  if (isComplete && !isPending) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">Check-ins Complete!</h1>
          <p className="text-muted-foreground max-w-md">You've logged all {experiment.durationDays} days. Time for the final results.</p>
          <Link href={`/experiments/${id}/follow-up`}>
            <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
              Complete Final Snapshot
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const onSubmit = (values: z.infer<typeof checkinSchema>) => {
    addCheckin({
      experimentId: id,
      dayNumber: nextDayNumber,
      ...values
    }, {
      onSuccess: () => {
        // Reset form or show success message
        // For MVP, just reload or show success toast (handled in hook)
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Daily Log</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Day {nextDayNumber} of {experiment.durationDays}
            </p>
          </div>
          <Link href={`/experiments/${id}/follow-up`}>
             <button className="text-sm text-primary hover:underline flex items-center gap-1">
               Skip to Results <ArrowRight className="w-3 h-3" />
             </button>
          </Link>
        </header>

        <div className="grid gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="adherence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between text-base">
                        <span>Routine Adherence</span>
                        <span className="font-bold text-primary">{field.value}%</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={10}
                          defaultValue={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Did you follow your routine exactly?</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between text-base">
                        <span>Stress Today (1-5)</span>
                        <span className="font-bold text-primary">{field.value}</span>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="makeup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-white/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Wore Makeup Today?</FormLabel>
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

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Log Check-in"}
                </button>
              </form>
            </Form>
          </div>

          {/* History / Progress */}
          <div className="space-y-4">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Progress</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: experiment.durationDays || 7 }).map((_, i) => {
                const dayLog = checkins?.find(c => c.dayNumber === i + 1);
                return (
                  <div 
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border ${
                      dayLog 
                        ? "bg-green-100 border-green-200 text-green-700" 
                        : i + 1 === nextDayNumber 
                          ? "bg-primary/10 border-primary text-primary animate-pulse" 
                          : "bg-secondary/30 border-dashed text-muted-foreground"
                    }`}
                  >
                    {dayLog ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
