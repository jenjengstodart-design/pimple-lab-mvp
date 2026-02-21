import { Link, useLocation } from "wouter";
import { FlaskConical, Home, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/30 flex flex-col font-body">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Pimple<span className="text-primary">Lab</span>
            </span>
          </Link>

          {location !== "/" && (
            <nav className="flex items-center gap-1">
              <Link href="/">
                <button className={cn(
                  "p-2 rounded-lg transition-all hover:bg-secondary",
                  location === "/" ? "bg-secondary text-primary" : "text-muted-foreground"
                )}>
                  <Home className="w-5 h-5" />
                  <span className="sr-only">Home</span>
                </button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50 bg-white/40">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Pimple Lab. Educational experimentation only.</p>
          <p className="mt-1 text-xs opacity-70">Not medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
