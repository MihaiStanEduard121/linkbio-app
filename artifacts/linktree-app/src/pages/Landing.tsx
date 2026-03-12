import { Link } from "wouter";
import { motion } from "framer-motion";
import { Link as LinkIcon, Sparkles, Zap, LayoutTemplate, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">LinkBio</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hidden sm:inline-flex h-11 items-center px-6 text-sm font-semibold hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-xl bg-white text-black px-6 text-sm font-bold hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Hero Background" className="w-full h-full object-cover opacity-30 mask-image:linear-gradient(to_bottom,black,transparent)" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-accent/30 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80">The new standard for creators</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-extrabold leading-[1.1] mb-8 tracking-tighter">
              One link to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-orange-400">rule them all.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/60 mb-10 leading-relaxed font-light">
              Create a beautiful, personalized page to showcase everything you are and everything you do. Fully customizable. Free forever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-8 text-lg font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all">
                Claim your link <Zap className="w-5 h-5 ml-2" />
              </Link>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-white/40 font-mono text-lg">linkb.io/</span>
                <input type="text" placeholder="yourname" className="h-14 w-full sm:w-64 rounded-2xl bg-white/5 border border-white/10 pl-28 pr-6 text-lg font-mono focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9, rotateY: 15 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative mx-auto lg:ml-auto w-full max-w-[360px] perspective-1000">
            <div className="w-full h-[760px] rounded-[3rem] border-[12px] border-black bg-[#0f172a] overflow-hidden shadow-2xl shadow-primary/20 relative transform rotate-y-[-5deg] rotate-x-[5deg]">
              <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-3xl w-1/2 mx-auto z-20" />
              
              <div className="p-8 pt-16 flex flex-col items-center h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
                <div className="w-28 h-28 rounded-full border-4 border-white/10 overflow-hidden mb-4 shadow-2xl z-10">
                  <img src={`${import.meta.env.BASE_URL}images/default-avatar.png`} alt="Demo Avatar" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold font-display mb-2 z-10">@creator</h2>
                <p className="text-sm text-center text-white/60 mb-8 z-10">Digital artist & developer making cool things on the internet.</p>
                
                <div className="w-full space-y-4 z-10">
                  {['My Portfolio', 'Latest Video', 'Twitter', 'Github'].map((text, i) => (
                    <div key={i} className="w-full h-14 bg-white/10 rounded-2xl flex items-center justify-center font-medium border border-white/5 backdrop-blur-md shadow-lg transform transition hover:scale-105">
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-black/40 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <LayoutTemplate className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Infinite Themes</h3>
              <p className="text-white/60 leading-relaxed">Customize every pixel. Gradients, glassmorphism, neon glows, or keep it minimal. Your brand, your way.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Deep Analytics</h3>
              <p className="text-white/60 leading-relaxed">Track views, monitor clicks, and understand your audience with built-in beautiful charts.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Blazing Fast</h3>
              <p className="text-white/60 leading-relaxed">Built on modern edge infrastructure so your profile loads instantly anywhere in the world.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
