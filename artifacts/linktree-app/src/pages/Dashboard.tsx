import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Link as LinkIcon, Palette, BarChart3, UserCircle, LogOut, Loader2, Menu } from "lucide-react";

import { Button } from "@/components/ui";
import { ProfileView } from "@/components/ProfileView";
import { useApiAuth, clearToken } from "@/lib/auth";
import { useGetMe, useGetLinks } from "@workspace/api-client-react";

import { LinksTab } from "@/components/dashboard/LinksTab";
import { AppearanceTab } from "@/components/dashboard/AppearanceTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const authOptions = useApiAuth();

  const { data: user, isLoading: userLoading, error: userError } = useGetMe({ ...authOptions, query: { retry: false } });
  const { data: links = [], isLoading: linksLoading } = useGetLinks(authOptions);

  const [activeTab, setActiveTab] = useState<"links" | "appearance" | "analytics" | "profile">("links");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewAppearance, setPreviewAppearance] = useState<any>(null);

  useEffect(() => {
    if (userError) {
      clearToken();
      setLocation("/login");
    }
  }, [userError, setLocation]);

  useEffect(() => {
    if (user && !previewAppearance) {
      setPreviewAppearance(user.appearance || {});
    }
  }, [user, previewAppearance]);

  if (userLoading || linksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const navItems = [
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ] as const;

  const previewProfileData = {
    ...user,
    appearance: previewAppearance || user.appearance
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 lg:pr-[480px] xl:pr-[540px]">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold hidden sm:block">LinkBio</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href={`/${user.username}`} target="_blank" rel="noreferrer" className="hidden sm:flex px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors">
              linkb.io/<span className="text-primary ml-0.5">{user.username}</span>
            </a>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex text-white/70 hover:text-red-400 hover:bg-red-400/10">
              <LogOut className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className={`sm:sticky sm:top-[73px] z-30 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-2 overflow-x-auto hide-scrollbar transition-all ${mobileMenuOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="flex gap-2 min-w-max">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-primary/20 text-primary' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} className="sm:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-400/80 hover:bg-red-400/10 mt-4 w-full">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full">
            {activeTab === "links" && <LinksTab links={links} />}
            {activeTab === "appearance" && <AppearanceTab profile={user} onChange={setPreviewAppearance} />}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "profile" && <ProfileTab profile={user} />}
          </div>
        </main>
      </div>

      {/* Live Preview Panel (Desktop only) */}
      <div className="hidden lg:flex fixed top-0 bottom-0 right-0 w-[480px] xl:w-[540px] items-center justify-center p-8 z-20 bg-black/40 backdrop-blur-2xl border-l border-white/10">
        <div className="w-[340px] h-[720px] rounded-[3rem] border-[12px] border-black/90 bg-background overflow-hidden relative shadow-2xl shadow-black ring-1 ring-white/10 transform transition-transform hover:scale-[1.02] duration-500">
          <div className="absolute top-0 inset-x-0 h-7 bg-black/90 rounded-b-3xl w-40 mx-auto z-50 flex justify-center pt-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          <div className="w-full h-full overflow-y-auto hide-scrollbar relative">
            <ProfileView profile={previewProfileData} links={links} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
