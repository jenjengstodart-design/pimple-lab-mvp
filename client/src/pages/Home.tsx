import { Link } from "wouter";
import { ArrowRight, Sparkles, Activity, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-12 py-10 md:py-20">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Science-backed experimentation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight">
            Turn teenage skincare into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">science experiment</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Start testing. Track your routine changes, log daily adherence, and visualize your skin's progress with data.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/snapshot">
            <button className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-xl transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/20">
              <span className="mr-2 text-lg">Start Experiment</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5 opacity-70">
            <ShieldCheck className="w-3 h-3" />
            Educational experimentation only. Not medical advice.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full pt-12">
          {[
            { 
              icon: Activity, 
              title: "Daily Check-ins", 
              desc: "Log stress, makeup, and adherence in seconds." 
            },
            { 
              icon: Sparkles, 
              title: "AI Analysis", 
              desc: "Identify acne types with visual recognition." 
            },
            { 
              icon: ShieldCheck, 
              title: "Data Driven", 
              desc: "See what actually works for your unique skin." 
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
              className="glass-panel p-6 rounded-2xl text-left hover:border-primary/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
