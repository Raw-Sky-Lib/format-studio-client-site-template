// Curated icon set. One source of truth for both the renderer (<SectionIcon>)
// and the editor picker (<EditableIcon>).
//
// Names are kebab-case in stored data ("check-circle", "trending-up"). The
// library maps each name to the matching lucide-react PascalCase component.
// Picking a fixed subset (~70 icons) keeps the picker scannable AND the
// bundle small (each icon tree-shakes individually).
//
// Adding a new icon: import it below + add to ICON_LIBRARY with a kebab name.

import {
  // Status / value
  Check, CheckCircle2, X, XCircle, Star, Sparkles, Heart, Zap, Rocket, Award, Trophy, Flame,
  // Action
  ArrowRight, ArrowUpRight, ChevronRight, Play, Download, Upload, Send,
  // Communication
  Mail, Phone, MessageCircle, MessageSquare, MapPin, Globe, Bell,
  // People
  User, Users, UserPlus, UserCheck, Briefcase, Handshake,
  // Tech
  Code, Code2, Terminal, Cpu, Database, Server, Cloud, Lock, Shield, Key,
  // Productivity
  Calendar, Clock, Timer, Target, BarChart3, TrendingUp, Activity, LineChart, PieChart,
  // Commerce
  DollarSign, Tag, ShoppingCart, ShoppingBag, CreditCard, Package, Gift, Wallet,
  // Content
  BookOpen, FileText, File, Folder, Layers, Bookmark, Hash, Newspaper,
  // Media
  Camera, Image as ImageIcon, Video, Music, Headphones, Mic, Film, Tv,
  // Creative
  Lightbulb, Palette, Paintbrush, Scissors, Wand2,
  // Tools
  Settings, Wrench, Hammer, Ruler,
  // Discovery
  Search, Eye, Compass,
  // Misc
  Smile, ThumbsUp, Coffee, Quote, Plug,
  type LucideIcon,
} from 'lucide-react'

/**
 * Kebab-case name → lucide component. Stable across versions; safe to store
 * in Supabase. Don't rename existing entries — that'd silently swap icons on
 * every page that referenced the old name.
 */
export const ICON_LIBRARY: Record<string, LucideIcon> = {
  // Status / value
  'check':         Check,
  'check-circle':  CheckCircle2,
  'x':             X,
  'x-circle':      XCircle,
  'star':          Star,
  'sparkles':      Sparkles,
  'heart':         Heart,
  'zap':           Zap,
  'rocket':        Rocket,
  'award':         Award,
  'trophy':        Trophy,
  'flame':         Flame,
  // Action
  'arrow-right':    ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'chevron-right':  ChevronRight,
  'play':           Play,
  'download':       Download,
  'upload':         Upload,
  'send':           Send,
  // Communication
  'mail':            Mail,
  'phone':           Phone,
  'message-circle':  MessageCircle,
  'message-square':  MessageSquare,
  'map-pin':         MapPin,
  'globe':           Globe,
  'bell':            Bell,
  // People
  'user':         User,
  'users':        Users,
  'user-plus':    UserPlus,
  'user-check':   UserCheck,
  'briefcase':    Briefcase,
  'handshake':    Handshake,
  // Tech
  'code':       Code,
  'code-2':     Code2,
  'terminal':   Terminal,
  'cpu':        Cpu,
  'database':   Database,
  'server':     Server,
  'cloud':      Cloud,
  'lock':       Lock,
  'shield':     Shield,
  'key':        Key,
  // Productivity
  'calendar':     Calendar,
  'clock':        Clock,
  'timer':        Timer,
  'target':       Target,
  'bar-chart':    BarChart3,
  'trending-up':  TrendingUp,
  'activity':     Activity,
  'line-chart':   LineChart,
  'pie-chart':    PieChart,
  // Commerce
  'dollar-sign':    DollarSign,
  'tag':            Tag,
  'shopping-cart':  ShoppingCart,
  'shopping-bag':   ShoppingBag,
  'credit-card':    CreditCard,
  'package':        Package,
  'gift':           Gift,
  'wallet':         Wallet,
  // Content
  'book-open':   BookOpen,
  'file-text':   FileText,
  'file':        File,
  'folder':      Folder,
  'layers':      Layers,
  'bookmark':    Bookmark,
  'hash':        Hash,
  'newspaper':   Newspaper,
  // Media
  'camera':      Camera,
  'image':       ImageIcon,
  'video':       Video,
  'music':       Music,
  'headphones':  Headphones,
  'mic':         Mic,
  'film':        Film,
  'tv':          Tv,
  // Creative
  'lightbulb':   Lightbulb,
  'palette':     Palette,
  'paintbrush':  Paintbrush,
  'scissors':    Scissors,
  'wand':        Wand2,
  // Tools
  'settings':  Settings,
  'wrench':    Wrench,
  'hammer':    Hammer,
  'ruler':     Ruler,
  // Discovery
  'search':    Search,
  'eye':       Eye,
  'compass':   Compass,
  // Misc
  'smile':      Smile,
  'thumbs-up':  ThumbsUp,
  'coffee':     Coffee,
  'quote':      Quote,
  'plug':       Plug,
}

export const ICON_NAMES: string[] = Object.keys(ICON_LIBRARY).sort()

/**
 * True if the name is one of our curated icons. Useful for renderers that
 * fall back to plain-text display (e.g. emoji left over from before the
 * icon library shipped) when the name doesn't resolve.
 */
export function isKnownIcon(name: string | null | undefined): name is string {
  return !!name && name in ICON_LIBRARY
}
