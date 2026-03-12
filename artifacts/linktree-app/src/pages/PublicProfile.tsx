import { useRoute } from "wouter";
import { useGetPublicProfile, useRecordView, useRecordClick } from "@workspace/api-client-react";
import { ProfileView } from "@/components/ProfileView";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { Link } from "wouter";
import { useEffect, useRef } from "react";

export default function PublicProfile() {
  const [, params] = useRoute("/:username");
  const username = params?.username || "";
  
  const { data: profileData, isLoading, error } = useGetPublicProfile(username, {
    query: { retry: false, enabled: !!username, refetchOnWindowFocus: false }
  });

  const recordView = useRecordView();
  const recordClick = useRecordClick();
  const hasRecordedView = useRef(false);

  useEffect(() => {
    if (profileData && !hasRecordedView.current) {
      hasRecordedView.current = true;
      recordView.mutate({ username });
    }
  }, [profileData, username, recordView]);

  const handleLinkClick = (linkId: string, url: string) => {
    recordClick.mutate({ linkId });
    window.open(url, "_blank");
  };

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
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
          <AlertCircle className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Profile not found</h1>
        <p className="text-white/60 mb-8 max-w-sm">The user "{username}" doesn't exist or has been removed.</p>
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-8 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <ProfileView 
        profile={profileData} 
        links={profileData.links || []} 
        onLinkClick={handleLinkClick}
      />
      
      {/* Branding footer */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <Link href="/" className="px-6 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs font-bold font-display tracking-widest uppercase text-white/50 hover:text-white hover:bg-black/40 transition-all shadow-xl">
          Powered by LinkBio
        </Link>
      </div>
    </div>
  );
}
