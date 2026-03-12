import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button, Input, Label } from "@/components/ui";
import { useUpdateProfile, getGetMeQueryKey, type UserProfile } from "@workspace/api-client-react";
import { useApiAuth } from "@/lib/auth";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores, and hyphens"),
  bio: z.string().max(160, "Bio max 160 characters").optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export function ProfileTab({ profile }: { profile: UserProfile }) {
  const authOpts = useApiAuth();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile({ request: authOpts.request });

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, watch } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
    }
  });

  const currentAvatar = watch("avatarUrl");

  const onSave = async (data: any) => {
    try {
      await updateProfile.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (e: any) {
      alert(e.message || "Failed to update profile");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/10 bg-black/50">
            <img src={currentAvatar || `${import.meta.env.BASE_URL}images/default-avatar.png`} alt="Avatar Preview" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">Your Profile</h2>
            <p className="text-white/60">Manage your public identity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">linkb.io/</span>
              <Input className="pl-[85px] font-mono" {...register("username")} />
            </div>
            {errors.username && <p className="text-destructive text-xs">{errors.username.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <textarea 
              className="flex min-h-[120px] w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 resize-none transition-all"
              placeholder="Tell the world about yourself..."
              {...register("bio")} 
            />
            {errors.bio && <p className="text-destructive text-xs">{errors.bio.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input placeholder="https://..." {...register("avatarUrl")} />
            <p className="text-xs text-white/40 mt-1">Paste a direct link to an image to use as your avatar.</p>
            {errors.avatarUrl && <p className="text-destructive text-xs">{errors.avatarUrl.message as string}</p>}
          </div>
          
          <div className="pt-6">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
              Save Profile Profile
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
