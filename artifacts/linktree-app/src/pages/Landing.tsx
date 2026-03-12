import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/ProfileView";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  const demoLinks = [
    { id: "1", title: "My Personal Website", url: "#", order: 0, userId: "demo" },
    { id: "2", title: "Latest YouTube Video", url: "#", order: 1, userId: "demo" },
    { id: "3", title: "Follow me on Twitter", url: "#", order: 2, userId: "demo" },
  ];

  const demoProfile = {
    username: "alex_design",
    bio: "Digital creator, designer & developer making cool things on the internet.",
    avatarUrl: `${import.meta.env.BASE_URL}images/default-avatar.png`
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Abstract glowing background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[50px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-wide">LinkBio</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/register">
            <Button size="sm" className="hidden sm:flex">Sign up free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 gap-12 lg:gap-24 py-12 lg:py-0">
        
        {/* Left Copy */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-white/80">The new standard for creators</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            One link to rule <br />
            <span className="text-gradient">them all.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 mb-10 max-w-xl"
          >
            Create a beautiful, personalized page to showcase everything you are and everything you do. Free forever.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group">
                Claim your link
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Already have an account?
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
          className="flex-1 w-full max-w-md lg:max-w-none flex justify-center perspective-[1000px]"
        >
          <div className="transform-gpu rotate-y-[-10deg] rotate-x-[5deg] scale-105">
            <ProfileView profile={demoProfile} links={demoLinks} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
