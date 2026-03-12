import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Pencil, Trash2, Check, X, LogOut, Loader2, Link as LinkIcon, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileView } from "@/components/ProfileView";
import { useApiAuth, clearToken } from "@/lib/auth";
import { 
  useGetMe, 
  useGetLinks, 
  useUpdateProfile, 
  useCreateLink, 
  useUpdateLink, 
  useDeleteLink,
  getGetLinksQueryKey,
  getGetMeQueryKey
} from "@workspace/api-client-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  bio: z.string().max(160, "Bio max 160 characters").optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
});

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const authOptions = useApiAuth();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading, error: userError } = useGetMe({ ...authOptions, query: { retry: false } });
  const { data: links = [], isLoading: linksLoading } = useGetLinks(authOptions);

  const updateProfile = useUpdateProfile({ request: authOptions.request });
  const createLink = useCreateLink({ request: authOptions.request });
  const updateLink = useUpdateLink({ request: authOptions.request });
  const deleteLink = useDeleteLink({ request: authOptions.request });

  const [activeTab, setActiveTab] = useState<"links" | "profile">("links");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Profile Form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { isDirty: isProfileDirty, isSubmitting: isProfileSubmitting } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema)
  });

  // New Link Form
  const { register: registerNewLink, handleSubmit: handleNewLinkSubmit, reset: resetNewLink, formState: { errors: newLinkErrors } } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema)
  });

  // Edit Link Form
  const { register: registerEditLink, handleSubmit: handleEditLinkSubmit, reset: resetEditLink } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema)
  });

  useEffect(() => {
    if (userError) {
      clearToken();
      setLocation("/login");
    }
  }, [userError, setLocation]);

  useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, resetProfile]);

  if (userLoading || linksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const onProfileSave = async (data: z.infer<typeof profileSchema>) => {
    await updateProfile.mutateAsync({ data: data as any });
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const onAddLink = async (data: z.infer<typeof linkSchema>) => {
    await createLink.mutateAsync({ data });
    queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
    resetNewLink();
  };

  const startEditLink = (link: any) => {
    setEditingLinkId(link.id);
    resetEditLink({ title: link.title, url: link.url });
  };

  const onSaveEditLink = async (data: z.infer<typeof linkSchema>) => {
    if (!editingLinkId) return;
    await updateLink.mutateAsync({ linkId: editingLinkId, data });
    queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
    setEditingLinkId(null);
  };

  const onDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    await deleteLink.mutateAsync({ linkId: id });
    queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
  };

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-y-auto border-r border-white/10 relative z-10">
        
        {/* Header */}
        <header className="sticky top-0 z-20 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`/${user.username}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-white/60 hover:text-white hover:underline">
              linkb.io/{user.username}
            </a>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-white/70" />
            </Button>
          </div>
        </header>

        <div className="p-6 sm:p-10 max-w-2xl mx-auto w-full flex-1">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 glass-panel rounded-xl mb-8 w-fit mx-auto sm:mx-0">
            <button 
              onClick={() => setActiveTab("links")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "links" ? "bg-white/10 text-white shadow-sm" : "text-white/60 hover:text-white"}`}
            >
              <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Links</span>
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "profile" ? "bg-white/10 text-white shadow-sm" : "text-white/60 hover:text-white"}`}
            >
              <span className="flex items-center gap-2"><UserCircle className="w-4 h-4"/> Profile</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "links" ? (
              <motion.div 
                key="links"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Add Link Form */}
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-4">Add New Link</h3>
                  <form onSubmit={handleNewLinkSubmit(onAddLink)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input placeholder="e.g. My Latest Video" {...registerNewLink("title")} />
                      {newLinkErrors.title && <p className="text-destructive text-xs">{newLinkErrors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input placeholder="https://..." {...registerNewLink("url")} />
                      {newLinkErrors.url && <p className="text-destructive text-xs">{newLinkErrors.url.message}</p>}
                    </div>
                    <Button type="submit" disabled={createLink.isPending} className="w-full">
                      {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2"/> Add Link</>}
                    </Button>
                  </form>
                </div>

                {/* Link List */}
                <div className="space-y-4">
                  {links.length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-white/20">
                      <p className="text-white/50">You don't have any links yet.</p>
                    </div>
                  ) : (
                    links.sort((a, b) => (a.order || 0) - (b.order || 0)).map((link) => (
                      <motion.div layout key={link.id} className="glass-panel p-4 rounded-xl flex items-start sm:items-center gap-4 group">
                        <div className="mt-1 sm:mt-0 text-white/30 cursor-grab hover:text-white/60">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        {editingLinkId === link.id ? (
                          <form onSubmit={handleEditLinkSubmit(onSaveEditLink)} className="flex-1 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 space-y-3">
                              <Input size={1} className="h-9 text-sm" placeholder="Title" {...registerEditLink("title")} />
                              <Input size={1} className="h-9 text-sm" placeholder="URL" {...registerEditLink("url")} />
                            </div>
                            <div className="flex gap-2 justify-end sm:items-center">
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditingLinkId(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button type="submit" size="icon" className="h-9 w-9">
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-semibold text-white truncate">{link.title}</h4>
                              <p className="text-sm text-white/50 truncate mt-1">{link.url}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={() => startEditLink(link)} className="text-white/60 hover:text-white">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDeleteLink(link.id!)} className="text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel p-6 sm:p-8 rounded-2xl"
              >
                <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input {...registerProfile("username")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
                      placeholder="Tell the world about yourself..."
                      {...registerProfile("bio")} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <Input placeholder="https://..." {...registerProfile("avatarUrl")} />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={!isProfileDirty || isProfileSubmitting}>
                      {isProfileSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Preview Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] items-center justify-center p-8 relative z-10 border-l border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="w-[320px] h-[680px] rounded-[3rem] border-[8px] border-black/80 bg-background overflow-hidden relative shadow-2xl ring-1 ring-white/10">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-black/80 rounded-b-3xl w-1/2 mx-auto z-50" />
          
          {/* Scrollable preview content */}
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            {/* Pass user directly to ProfileView. Re-map slightly to fit expected props if needed */}
            <div className="scale-[0.9] origin-top">
              <ProfileView 
                profile={user} 
                links={links} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
