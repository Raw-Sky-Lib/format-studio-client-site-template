// Curated Phosphor icon set (~90 icons, Regular weight).
// Maps kebab-case storage keys → Phosphor React components.
// Import only what we use so the bundle stays small.
//
// Adding a new icon: import it below + add to PHOSPHOR_LIBRARY with a kebab key.
// Don't rename existing entries — that'd silently swap icons in stored data.

import type { CSSProperties, FC } from 'react'

// Plain interface avoids conflicts with SVG attribute types.
type PhosphorIcon = FC<{
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
  style?: CSSProperties
  'aria-hidden'?: boolean | 'true' | 'false'
}>
import {
  // Status / value
  Check, CheckCircle, X, XCircle, Star, Sparkle, Heart, Lightning, Rocket, Trophy, Flame, Medal,
  // Action
  ArrowRight, ArrowUpRight, CaretRight, Play, DownloadSimple, UploadSimple, PaperPlaneTilt,
  // Communication
  Envelope, Phone, ChatCircle, ChatCentered, MapPin, Globe, Bell,
  // People
  User, Users, UserPlus, UserCheck, Briefcase, Handshake,
  // Tech
  Code, Terminal, Cpu, Database, Cloud, Lock, Shield, Key, DeviceMobile, Laptop,
  // Productivity
  Calendar, Clock, Timer, Target, ChartBar, TrendUp, ChartLine, ChartPieSlice,
  // Commerce
  CurrencyDollar, Tag, ShoppingCart, ShoppingBag, CreditCard, Package, Gift, Wallet,
  // Content
  BookOpen, FileText, File, Folder, Stack, Bookmark, Hash, Newspaper,
  // Media
  Camera, Image, VideoCamera, MusicNote, Headphones, Microphone, FilmStrip, Television,
  // Creative
  Lightbulb, Palette, PaintBrush, Scissors, MagicWand,
  // Tools
  Gear, Wrench, Hammer, Ruler,
  // Discovery
  MagnifyingGlass, Eye, Compass,
  // Misc
  Smiley, ThumbsUp, Coffee, Quotes, Plug,
} from '@phosphor-icons/react'

export const PHOSPHOR_LIBRARY: Record<string, PhosphorIcon> = {
  // Status / value
  'check':          Check,
  'check-circle':   CheckCircle,
  'x':              X,
  'x-circle':       XCircle,
  'star':           Star,
  'sparkle':        Sparkle,
  'heart':          Heart,
  'lightning':      Lightning,
  'rocket':         Rocket,
  'trophy':         Trophy,
  'flame':          Flame,
  'medal':          Medal,
  // Action
  'arrow-right':       ArrowRight,
  'arrow-up-right':    ArrowUpRight,
  'caret-right':       CaretRight,
  'play':              Play,
  'download':          DownloadSimple,
  'upload':            UploadSimple,
  'paper-plane':       PaperPlaneTilt,
  // Communication
  'envelope':      Envelope,
  'phone':         Phone,
  'chat-circle':    ChatCircle,
  'chat-centered':  ChatCentered,
  'map-pin':       MapPin,
  'globe':         Globe,
  'bell':          Bell,
  // People
  'user':         User,
  'users':        Users,
  'user-plus':    UserPlus,
  'user-check':   UserCheck,
  'briefcase':    Briefcase,
  'handshake':    Handshake,
  // Tech
  'code':           Code,
  'terminal':       Terminal,
  'cpu':            Cpu,
  'database':       Database,
  'cloud':          Cloud,
  'lock':           Lock,
  'shield':         Shield,
  'key':            Key,
  'device-mobile':  DeviceMobile,
  'laptop':         Laptop,
  // Productivity
  'calendar':        Calendar,
  'clock':           Clock,
  'timer':           Timer,
  'target':          Target,
  'chart-bar':       ChartBar,
  'trend-up':        TrendUp,
  'chart-line':      ChartLine,
  'chart-pie':       ChartPieSlice,
  // Commerce
  'dollar-sign':    CurrencyDollar,
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
  'stack':       Stack,
  'bookmark':    Bookmark,
  'hash':        Hash,
  'newspaper':   Newspaper,
  // Media
  'camera':       Camera,
  'image':        Image,
  'video':        VideoCamera,
  'music':        MusicNote,
  'headphones':   Headphones,
  'microphone':   Microphone,
  'film':         FilmStrip,
  'tv':           Television,
  // Creative
  'lightbulb':   Lightbulb,
  'palette':     Palette,
  'paintbrush':  PaintBrush,
  'scissors':    Scissors,
  'magic-wand':  MagicWand,
  // Tools
  'gear':     Gear,
  'wrench':   Wrench,
  'hammer':   Hammer,
  'ruler':    Ruler,
  // Discovery
  'search':   MagnifyingGlass,
  'eye':      Eye,
  'compass':  Compass,
  // Misc
  'smile':      Smiley,
  'thumbs-up':  ThumbsUp,
  'coffee':     Coffee,
  'quote':      Quotes,
  'plug':       Plug,
}

export const PHOSPHOR_NAMES: string[] = Object.keys(PHOSPHOR_LIBRARY).sort()
