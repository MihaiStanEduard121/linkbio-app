import { 
  Link as LinkIcon, 
  Youtube, 
  Twitter, 
  Instagram, 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  Music, 
  Twitch,
  Palette,
  BarChart3,
  UserCircle,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  Eye,
  MousePointerClick
} from "lucide-react";

export const ICONS = {
  link: LinkIcon,
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  globe: Globe,
  music: Music,
  twitch: Twitch
};

export type IconName = keyof typeof ICONS;

export function getIcon(name?: string | null) {
  if (!name || !(name in ICONS)) return Globe;
  return ICONS[name as IconName];
}
