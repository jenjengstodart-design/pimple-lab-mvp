import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useExperiment, useCheckins } from "@/hooks/use-experiments";
import { Loader2, Share2, CheckCircle2, AlertCircle, MinusCircle, Home } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Results() {
  const [match, params] = useRoute("/experiments/:id/results");
  const id = Number(params?.id);
  
  const { data: experiment, isLoading: expLoading } = useExperiment(id);
  const { data: checkins, isLoading: checkinsLoading } = useCheckins(id);

  if (expLoading || checkinsLoading || !experiment) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const avgAdherence = checkins && checkins.length > 0
    ? Math.round(checkins.reduce((acc, c) => acc + c.adherence, 0) / checkins.length)
    : 0;

  const getOutcomeColor = (outcome: string | null) => {
    if (outcome === 'better') return 'text-green-600 bg-green-100';
    if (outcome === 'worse') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getOutcomeIcon = (outcome: string | null) => {
    if (outcome === 'better') return CheckCircle2;
    if (outcome === 'worse') return AlertCircle;
    return MinusCircle;
  };

  const OutcomeIcon = getOutcomeIcon(experiment.outcome);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold tracking-wider text-sm uppercase">
            Experiment Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Scientific Conclusion</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            You successfully completed a {experiment.durationDays}-day controlled experiment on your skin.
          </p>
        </div>

        {/* Big Outcome Card */}
        <div className="glass-panel p-8 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className={`inline-flex p-4 rounded-full ${getOutcomeColor(experiment.outcome)} mb-4`}>
            <OutcomeIcon className="w-12 h-12" />
          </div>
          
          <h2 className="text-3xl font-bold capitalize">Result: {experiment.outcome}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold mb-1">Adherence</div>
              <div className="text-2xl font-bold text-foreground">{avgAdherence}%</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold mb-1">Duration</div>
              <div className="text-2xl font-bold text-foreground">{experiment.durationDays} Days</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold mb-1">Start Stress</div>
              <div className="text-2xl font-bold text-foreground">{experiment.stressLevel}/5</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold mb-1">Acne Type</div>
              <div className="text-xl font-bold text-foreground capitalize truncate">{experiment.acneType}</div>
            </div>
          </div>
        </div>

        {/* Before/After */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl ml-2">Visual Evidence</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative group rounded-2xl overflow-hidden h-80 shadow-md">
              <img src={experiment.initialImageUrl} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold">
                Day 1
              </div>
            </div>
            <div className="relative group rounded-2xl overflow-hidden h-80 shadow-md">
              <img src={experiment.followUpImageUrl || ""} alt="After" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold">
                Day {experiment.durationDays}
              </div>
            </div>
          </div>
        </div>

        {/* Adherence Chart */}
        {checkins && checkins.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-xl ml-2">Adherence Data</h3>
            <div className="glass-panel p-6 rounded-2xl h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkins}>
                  <XAxis dataKey="dayNumber" tickFormatter={(val) => `Day ${val}`} stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="adherence" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {checkins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.adherence >= 80 ? 'var(--primary)' : 'var(--destructive)'} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Footer Statement */}
        <div className="bg-primary/5 p-8 rounded-2xl text-center space-y-4">
          <p className="font-display font-bold text-lg text-primary">
            "This contributes to structured teenage skincare research."
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-xl font-bold hover:bg-secondary transition-colors shadow-sm">
                <Home className="w-4 h-4" />
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
