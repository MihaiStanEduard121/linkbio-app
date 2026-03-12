import { motion } from "framer-motion";
import { Link as LinkIcon, Share2 } from "lucide-react";
import type { UserProfile, Link as LinkType } from "@workspace/api-client-react";

interface ProfileViewProps {
  profile: Partial<UserProfile> | null;
  links: LinkType[];
  isEditable?: boolean;
}

export function ProfileView({ profile, links, isEditable = false }: ProfileViewProps) {
  const avatarSrc = profile?.avatarUrl || `${import.meta.env.BASE_URL}images/default-avatar.png`;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[800px] flex flex-col items-center py-16 px-6 relative overflow-hidden bg-background sm:rounded-[3rem] sm:border border-white/10 sm:shadow-2xl sm:shadow-primary/10">
      
      {/* Background ambient glow inside the phone frame */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header Actions */}
        <div className="w-full flex justify-end mb-8">
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-background shadow-xl ring-2 ring-primary/30 relative group">
            <img 
              src={avatarSrc} 
              alt={profile?.username || "Avatar"} 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            @{profile?.username || "username"}
          </h1>
          <p className="text-white/70 text-sm max-w-[280px] leading-relaxed">
            {profile?.bio || "Welcome to my LinkBio page! Here are all my important links."}
          </p>
        </motion.div>

        {/* Links List */}
        <div className="w-full space-y-4 flex flex-col">
          {links.length === 0 ? (
            <div className="text-center p-8 glass-panel rounded-3xl">
              <LinkIcon className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No links added yet.</p>
            </div>
          ) : (
            links
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative w-full h-16 flex items-center justify-center px-6 glass-panel rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                >
                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <span className="font-semibold text-white z-10 text-center w-full truncate">
                    {link.title}
                  </span>
                </motion.a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
