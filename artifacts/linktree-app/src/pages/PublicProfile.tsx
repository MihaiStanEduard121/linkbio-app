import { useRoute } from "wouter";
import { useGetPublicProfile } from "@workspace/api-client-react";
import { ProfileView } from "@/components/ProfileView";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PublicProfile() {
  const [, params] = useRoute("/:username");
  const username = params?.username || "";

  const { data: profileData, isLoading, error } = useGetPublicProfile(username, {
    query: { retry: false, enabled: !!username }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Profile not found</h1>
        <p className="text-white/60 mb-8 max-w-sm">The user "{username}" doesn't exist or has been removed.</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  // Map the API response format to the ProfileView format
  const profileInfo = {
    username: profileData.username,
    bio: profileData.bio,
    avatarUrl: profileData.avatarUrl,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 relative overflow-x-hidden">
      <div className="w-full">
        <ProfileView profile={profileInfo} links={profileData.links || []} />
      </div>
      
      {/* Branding footer */}
      <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
        <Link href="/" className="text-sm font-bold font-display tracking-widest uppercase hover:text-primary transition-colors">
          Created with LinkBio
        </Link>
      </div>
    </div>
  );
}
