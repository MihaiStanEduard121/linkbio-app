import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="text-center glass-panel p-12 rounded-3xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center ring-1 ring-white/10">
            <AlertCircle className="w-10 h-10 text-white/40" />
          </div>
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-white/60 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
