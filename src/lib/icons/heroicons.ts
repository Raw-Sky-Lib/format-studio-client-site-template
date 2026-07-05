// Curated Heroicons set (~85 icons, 24px outline variant).
// Maps kebab-case storage keys → Heroicons React components.
// Heroicons components use className/style for sizing (no size prop).
//
// Adding a new icon: import it below + add to HEROICONS_LIBRARY with a kebab key.
// Don't rename existing entries — that'd silently swap icons in stored data.

import type { CSSProperties, FC } from 'react'
import {
  // Status / value
  CheckIcon, CheckCircleIcon, XMarkIcon, XCircleIcon, StarIcon, SparklesIcon,
  HeartIcon, BoltIcon, RocketLaunchIcon, TrophyIcon, FireIcon,
  // Action
  ArrowRightIcon, ArrowTopRightOnSquareIcon, ChevronRightIcon, PlayIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon, PaperAirplaneIcon,
  // Communication
  EnvelopeIcon, PhoneIcon, ChatBubbleLeftIcon, ChatBubbleLeftRightIcon,
  MapPinIcon, GlobeAltIcon, BellIcon,
  // People
  UserIcon, UsersIcon, UserPlusIcon, UserCircleIcon, BriefcaseIcon,
  // Tech
  CodeBracketIcon, CommandLineIcon, CpuChipIcon, CircleStackIcon, CloudIcon,
  LockClosedIcon, ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon, ComputerDesktopIcon,
  // Productivity
  CalendarIcon, ClockIcon, ChartBarIcon, ArrowTrendingUpIcon, ChartPieIcon,
  // Commerce
  CurrencyDollarIcon, TagIcon, ShoppingCartIcon, ShoppingBagIcon, CreditCardIcon,
  ArchiveBoxIcon, GiftIcon, WalletIcon,
  // Content
  BookOpenIcon, DocumentTextIcon, DocumentIcon, FolderIcon, Squares2X2Icon,
  BookmarkIcon, HashtagIcon, NewspaperIcon,
  // Media
  CameraIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon, MicrophoneIcon, FilmIcon,
  TvIcon,
  // Creative
  LightBulbIcon, SwatchIcon, PaintBrushIcon, ScissorsIcon, WrenchScrewdriverIcon,
  // Tools
  CogIcon, WrenchIcon, AdjustmentsHorizontalIcon,
  // Discovery
  MagnifyingGlassIcon, EyeIcon, GlobeAmericasIcon,
  // Misc
  FaceSmileIcon, HandThumbUpIcon, ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline'

// Use a plain interface (not SVGProps) to avoid the stroke color vs stroke-width conflict.
type HeroIcon = FC<{ className?: string; style?: CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>

export const HEROICONS_LIBRARY: Record<string, HeroIcon> = {
  // Status / value
  'check':          CheckIcon,
  'check-circle':   CheckCircleIcon,
  'x-mark':         XMarkIcon,
  'x-circle':       XCircleIcon,
  'star':           StarIcon,
  'sparkles':       SparklesIcon,
  'heart':          HeartIcon,
  'bolt':           BoltIcon,
  'rocket':         RocketLaunchIcon,
  'trophy':         TrophyIcon,
  'fire':           FireIcon,
  // Action
  'arrow-right':      ArrowRightIcon,
  'arrow-top-right':  ArrowTopRightOnSquareIcon,
  'chevron-right':    ChevronRightIcon,
  'play':             PlayIcon,
  'download':         ArrowDownTrayIcon,
  'upload':           ArrowUpTrayIcon,
  'paper-airplane':   PaperAirplaneIcon,
  // Communication
  'envelope':           EnvelopeIcon,
  'phone':              PhoneIcon,
  'chat-bubble':        ChatBubbleLeftIcon,
  'chat-bubble-two':    ChatBubbleLeftRightIcon,
  'map-pin':            MapPinIcon,
  'globe':              GlobeAltIcon,
  'bell':               BellIcon,
  // People
  'user':          UserIcon,
  'users':         UsersIcon,
  'user-plus':     UserPlusIcon,
  'user-circle':   UserCircleIcon,
  'briefcase':     BriefcaseIcon,
  // Tech
  'code':           CodeBracketIcon,
  'terminal':       CommandLineIcon,
  'cpu':            CpuChipIcon,
  'database':       CircleStackIcon,
  'cloud':          CloudIcon,
  'lock':           LockClosedIcon,
  'shield':         ShieldCheckIcon,
  'key':            KeyIcon,
  'phone-mobile':   DevicePhoneMobileIcon,
  'desktop':        ComputerDesktopIcon,
  // Productivity
  'calendar':     CalendarIcon,
  'clock':        ClockIcon,
  'chart-bar':    ChartBarIcon,
  'trending-up':  ArrowTrendingUpIcon,
  'chart-pie':    ChartPieIcon,
  // Commerce
  'dollar-sign':    CurrencyDollarIcon,
  'tag':            TagIcon,
  'shopping-cart':  ShoppingCartIcon,
  'shopping-bag':   ShoppingBagIcon,
  'credit-card':    CreditCardIcon,
  'archive-box':    ArchiveBoxIcon,
  'gift':           GiftIcon,
  'wallet':         WalletIcon,
  // Content
  'book-open':   BookOpenIcon,
  'file-text':   DocumentTextIcon,
  'file':        DocumentIcon,
  'folder':      FolderIcon,
  'squares':     Squares2X2Icon,
  'bookmark':    BookmarkIcon,
  'hashtag':     HashtagIcon,
  'newspaper':   NewspaperIcon,
  // Media
  'camera':        CameraIcon,
  'photo':         PhotoIcon,
  'video':         VideoCameraIcon,
  'musical-note':  MusicalNoteIcon,
  'microphone':    MicrophoneIcon,
  'film':          FilmIcon,
  'tv':            TvIcon,
  // Creative
  'light-bulb':          LightBulbIcon,
  'swatch':              SwatchIcon,
  'paint-brush':         PaintBrushIcon,
  'scissors':            ScissorsIcon,
  'wrench-screwdriver':  WrenchScrewdriverIcon,
  // Tools
  'cog':          CogIcon,
  'wrench':       WrenchIcon,
  'adjustments':  AdjustmentsHorizontalIcon,
  // Discovery
  'magnifying-glass':  MagnifyingGlassIcon,
  'eye':               EyeIcon,
  'globe-americas':    GlobeAmericasIcon,
  // Misc
  'face-smile':     FaceSmileIcon,
  'hand-thumb-up':  HandThumbUpIcon,
  'chat-oval':      ChatBubbleOvalLeftIcon,
}

export const HEROICONS_NAMES: string[] = Object.keys(HEROICONS_LIBRARY).sort()
