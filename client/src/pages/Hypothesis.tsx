import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Layout } from "@/components/Layout";
import { useExperiment, useUpdateExperiment, useAnalyzeExperiment, useProducts } from "@/hooks/use-experiments";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, AlertCircle, CheckCircle2, FlaskConical, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Hypothesis() {
  const [match, params] = useRoute("/experiments/:id/hypothesis");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const { data: experiment, isLoading } = useExperiment(id);
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeExperiment();
  const { mutate: update, isPending: isUpdating } = useUpdateExperiment();

  // Local state for the form since we need to populate it after analysis
  const [routineDesc, setRoutineDesc] = useState("");
  const [duration, setDuration] = useState("7");
  const [selectedAcneType, setSelectedAcneType] = useState<string>("");

  const [analysisAttempted, setAnalysisAttempted] = useState(false);

  // Trigger analysis once if not already done
  useEffect(() => {
    if (experiment && !experiment.acneType && !isAnalyzing && !analysisAttempted) {
      setAnalysisAttempted(true);
      analyze(id);
    }
  }, [experiment, id, analyze, isAnalyzing, analysisAttempted]);

  // Sync state when experiment loads
  useEffect(() => {
    if (experiment) {
      if (experiment.acneType) setSelectedAcneType(experiment.acneType);
      if (experiment.routineDescription) setRoutineDesc(experiment.routineDescription);
      if (experiment.durationDays) setDuration(String(experiment.durationDays));
    }
  }, [experiment]);

  const { data: products } = useProducts(selectedAcneType);

  if (isLoading || !experiment) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading experiment data...</p>
        </div>
      </Layout>
    );
  }

  const handleStart = () => {
    update({
      id,
      acneType: selectedAcneType,
      routineDescription: routineDesc,
      durationDays: Number(duration),
    }, {
      onSuccess: () => navigate(`/experiments/${id}/checkin`)
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-3 rounded-xl">
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Hypothesis & Setup</h1>
            <p className="text-muted-foreground">Define your experiment parameters.</p>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="glass-panel rounded-2xl overflow-hidden border-l-4 border-l-primary">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
              AI Skin Analysis
            </h2>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing skin visual features...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                    <p className="text-sm text-muted-foreground">Detected Type</p>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-bold text-primary capitalize">{experiment.acneType || "Analysis Failed"}</h3>
                      <span className="text-sm font-medium bg-white px-2 py-1 rounded-md shadow-sm">
                        {experiment.confidence || 0}% Confidence
                      </span>
                    </div>
                  </div>

                  {experiment.hypothesis && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm font-medium text-blue-800 mb-1">Suggested Hypothesis</p>
                      <p className="text-blue-600 italic text-sm">"{experiment.hypothesis}"</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Override Assessment (if incorrect)</label>
                    <Select value={selectedAcneType} onValueChange={setSelectedAcneType}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comedonal">Comedonal (Blackheads/Whiteheads)</SelectItem>
                        <SelectItem value="inflammatory">Inflammatory (Papules/Pustules)</SelectItem>
                        <SelectItem value="cystic">Cystic (Deep, painful)</SelectItem>
                        <SelectItem value="hormonal">Hormonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden h-64 bg-black/5">
                  <img
                    src={experiment.initialImageUrl}
                    alt="Initial scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3">
                    <p className="text-white text-xs font-mono">Visual Features: {(experiment.visualFeatures as string[])?.join(", ") || "None detected"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experiment Setup */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4">Routine Protocol</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">What will you change?</label>
                  <Textarea
                    placeholder="e.g. Using Salicylic Acid cleanser twice daily..."
                    className="bg-white/50 min-h-[100px]"
                    value={routineDesc}
                    onChange={(e) => setRoutineDesc(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDuration("7")}
                      className={`p-4 rounded-xl border-2 transition-all ${duration === "7" ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-white hover:bg-white/80"}`}
                    >
                      <div className="font-bold text-lg">7 Days</div>
                      <div className="text-xs opacity-70">Short term test</div>
                    </button>
                    <button
                      onClick={() => setDuration("14")}
                      className={`p-4 rounded-xl border-2 transition-all ${duration === "14" ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-white hover:bg-white/80"}`}
                    >
                      <div className="font-bold text-lg">14 Days</div>
                      <div className="text-xs opacity-70">Recommended</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isUpdating || !routineDesc}
              className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? <Loader2 className="animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              Start Experiment
            </button>
          </div>

          {/* Product Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Recommended Products</h3>
            {products ? (
              <div className="space-y-4">
                {products.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                Select acne type to see recommendations
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
