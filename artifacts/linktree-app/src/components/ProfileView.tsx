import React from "react";
import { motion } from "framer-motion";
import { getIcon } from "./Icons";
import { type UserProfile, type PublicProfile, type Link, type Appearance } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  profile: Partial<UserProfile> | Partial<PublicProfile>;
  links: Link[];
  onLinkClick?: (linkId: string, url: string) => void;
  isPreview?: boolean;
}

export function ProfileView({ profile, links, onLinkClick, isPreview = false }: ProfileViewProps) {
  const app: Appearance = profile.appearance || {
    theme: "dark",
    btnStyle: "solid",
    btnRadius: 12,
    btnShadow: true,
    fontStyle: "inter"
  };

  // Build root styles based on theme and custom settings
  const getRootStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      fontFamily: `var(--font-${app.fontStyle || 'inter'})`,
      color: app.textColor || (app.theme === 'light' ? '#0f172a' : '#f8fafc'),
      minHeight: isPreview ? '100%' : '100vh',
    };

    if (app.theme === 'gradient') {
      styles.backgroundImage = `linear-gradient(${app.bgGradientAngle || 135}deg, ${app.bgGradientFrom || '#4f46e5'}, ${app.bgGradientTo || '#ec4899'})`;
      styles.backgroundColor = 'transparent';
    } else if (app.theme === 'neon') {
      styles.backgroundColor = '#030014';
      styles.backgroundImage = 'radial-gradient(circle at 50% 50%, rgba(120, 0, 255, 0.15) 0%, transparent 50%)';
    } else if (app.theme === 'glass') {
      styles.backgroundImage = `url(${import.meta.env.BASE_URL}images/hero-bg.png)`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundAttachment = 'fixed';
    } else if (app.theme === 'light') {
      styles.backgroundColor = app.bgColor || '#f8fafc';
    } else if (app.theme === 'minimal') {
      styles.backgroundColor = app.bgColor || '#ffffff';
      styles.color = app.textColor || '#000000';
    } else {
      // Dark
      styles.backgroundColor = app.bgColor || '#0f172a';
    }

    return styles;
  };

  const getButtonClass = () => {
    const base = "relative w-full flex items-center p-4 transition-all duration-300 outline-none";
    let styleClass = "";

    const isLightText = app.textColor ? false : (app.theme !== 'light' && app.theme !== 'minimal');

    switch (app.btnStyle) {
      case "outline":
        styleClass = isLightText 
          ? "border-2 border-white/20 hover:border-white/50 bg-transparent text-white" 
          : "border-2 border-black/20 hover:border-black/50 bg-transparent text-black";
        break;
      case "ghost":
        styleClass = isLightText
          ? "bg-white/5 hover:bg-white/10 text-white"
          : "bg-black/5 hover:bg-black/10 text-black";
        break;
      case "shadow":
        styleClass = isLightText
          ? "bg-white text-black hover:bg-white/90"
          : "bg-black text-white hover:bg-black/90";
        break;
      case "neon":
        styleClass = "bg-black/40 border border-primary/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] hover:border-primary";
        break;
      case "solid":
      default:
        styleClass = isLightText 
          ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10" 
          : "bg-black/5 hover:bg-black/10 text-black border border-black/10";
        break;
    }

    return cn(base, styleClass);
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div style={getRootStyles()} className="w-full h-full relative overflow-x-hidden">
      {app.theme === 'glass' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl z-0" />
      )}
      
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 flex flex-col items-center">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-6 relative group"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl relative z-10">
            <img 
              src={profile.avatarUrl || `${import.meta.env.BASE_URL}images/default-avatar.png`} 
              alt={profile.username} 
              className="w-full h-full object-cover"
            />
          </div>
          {app.theme === 'neon' && (
             <div className="absolute inset-0 rounded-full bg-primary blur-2xl opacity-50 z-0" />
          )}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold mb-2 text-center"
        >
          @{profile.username}
        </motion.h1>
        
        {profile.bio && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-center opacity-80 max-w-md mb-10 leading-relaxed font-medium"
          >
            {profile.bio}
          </motion.p>
        )}

        <motion.div 
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="w-full space-y-4 max-w-md"
        >
          {links.filter(l => l.enabled).map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <motion.div key={link.id} variants={itemAnimation} className="w-full block">
                <button
                  onClick={() => {
                    if (onLinkClick) onLinkClick(link.id, link.url);
                    else if (!isPreview) window.open(link.url, "_blank");
                  }}
                  className={getButtonClass()}
                  style={{
                    borderRadius: `${app.btnRadius ?? 12}px`,
                    boxShadow: app.btnShadow && app.theme !== 'neon' ? '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : undefined,
                  }}
                >
                  <div className="absolute left-4 opacity-80 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-center font-semibold text-[15px]">
                    {link.title}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
