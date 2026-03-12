import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button, Input, Label } from "@/components/ui";
import { useRegister } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";

const registerSchema = z.object({
  username: z.string().min(3, "Min 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and -"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await registerMutation.mutateAsync({ data });
      setToken(res.token);
      setLocation("/dashboard");
    } catch (e: any) {
      // handled
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Create your LinkBio</h1>
          <p className="text-white/60">Join thousands of creators today.</p>
        </div>

        <div className="glass-panel p-8 sm:p-10 rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">linkb.io/</span>
                <Input placeholder="yourname" className="pl-[80px]" {...register("username")} />
              </div>
              {errors.username && <p className="text-destructive text-xs">{errors.username.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message as string}</p>}
            </div>

            {registerMutation.isError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                Registration failed. Username or email might be taken.
              </div>
            )}

            <Button type="submit" size="lg" className="w-full text-base" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
              Create Account <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-white/60">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
