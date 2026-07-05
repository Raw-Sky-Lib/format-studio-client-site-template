// Curated Tabler icon set (~90 icons, stroke 1.5).
// Maps kebab-case storage keys → Tabler React components.
// Import only what we use so the bundle stays small.
//
// Adding a new icon: import it below + add to TABLER_LIBRARY with a kebab key.
// Don't rename existing entries — that'd silently swap icons in stored data.

import type { FC } from 'react'
import {
  // Status / value
  IconCheck, IconCircleCheck, IconX, IconCircleX, IconStar, IconSparkles, IconHeart,
  IconBolt, IconRocket, IconTrophy, IconFlame, IconMedal,
  // Action
  IconArrowRight, IconArrowUpRight, IconChevronRight, IconPlayerPlay, IconDownload,
  IconUpload, IconSend,
  // Communication
  IconMail, IconPhone, IconMessage, IconMessageDots, IconMapPin, IconWorld, IconBell,
  // People
  IconUser, IconUsers, IconUserPlus, IconUserCheck, IconBriefcase, IconUsersGroup,
  // Tech
  IconCode, IconTerminal, IconCpu, IconDatabase, IconCloud, IconLock, IconShield, IconKey,
  IconDeviceMobile, IconDeviceLaptop,
  // Productivity
  IconCalendar, IconClock, IconHourglass, IconTarget, IconChartBar, IconTrendingUp,
  IconActivity, IconChartLine, IconChartPie,
  // Commerce
  IconCurrencyDollar, IconTag, IconShoppingCart, IconShoppingBag, IconCreditCard,
  IconPackage, IconGift, IconWallet,
  // Content
  IconBook, IconFileText, IconFile, IconFolder, IconStack2, IconBookmark, IconHash, IconNews,
  // Media
  IconCamera, IconPhoto, IconVideo, IconMusic, IconHeadphones, IconMicrophone, IconMovie,
  IconDeviceTv,
  // Creative
  IconBulb, IconPalette, IconBrush, IconScissors, IconWand,
  // Tools
  IconSettings, IconTool, IconHammer, IconRuler,
  // Discovery
  IconSearch, IconEye, IconCompass,
  // Misc
  IconMoodSmile, IconThumbUp, IconCoffee, IconQuote, IconPlug,
} from '@tabler/icons-react'

// Use a plain interface (not SVGProps) so Tabler's numeric size/stroke props
// don't conflict with SVG's stroke color attribute (which is always string).
type TablerIcon = FC<{ size?: number | string; stroke?: number | string; className?: string }>

export const TABLER_LIBRARY: Record<string, TablerIcon> = {
  // Status / value
  'check':          IconCheck,
  'check-circle':   IconCircleCheck,
  'x':              IconX,
  'x-circle':       IconCircleX,
  'star':           IconStar,
  'sparkles':       IconSparkles,
  'heart':          IconHeart,
  'bolt':           IconBolt,
  'rocket':         IconRocket,
  'trophy':         IconTrophy,
  'flame':          IconFlame,
  'medal':          IconMedal,
  // Action
  'arrow-right':       IconArrowRight,
  'arrow-up-right':    IconArrowUpRight,
  'chevron-right':     IconChevronRight,
  'play':              IconPlayerPlay,
  'download':          IconDownload,
  'upload':            IconUpload,
  'send':              IconSend,
  // Communication
  'mail':           IconMail,
  'phone':          IconPhone,
  'message':        IconMessage,
  'message-dots':   IconMessageDots,
  'map-pin':        IconMapPin,
  'world':          IconWorld,
  'bell':           IconBell,
  // People
  'user':         IconUser,
  'users':        IconUsers,
  'user-plus':    IconUserPlus,
  'user-check':   IconUserCheck,
  'briefcase':     IconBriefcase,
  'users-group':   IconUsersGroup,
  // Tech
  'code':           IconCode,
  'terminal':       IconTerminal,
  'cpu':            IconCpu,
  'database':       IconDatabase,
  'cloud':          IconCloud,
  'lock':           IconLock,
  'shield':         IconShield,
  'key':            IconKey,
  'device-mobile':  IconDeviceMobile,
  'laptop':         IconDeviceLaptop,
  // Productivity
  'calendar':      IconCalendar,
  'clock':         IconClock,
  'hourglass':     IconHourglass,
  'target':        IconTarget,
  'chart-bar':     IconChartBar,
  'trending-up':   IconTrendingUp,
  'activity':      IconActivity,
  'chart-line':    IconChartLine,
  'chart-pie':     IconChartPie,
  // Commerce
  'dollar-sign':    IconCurrencyDollar,
  'tag':            IconTag,
  'shopping-cart':  IconShoppingCart,
  'shopping-bag':   IconShoppingBag,
  'credit-card':    IconCreditCard,
  'package':        IconPackage,
  'gift':           IconGift,
  'wallet':         IconWallet,
  // Content
  'book':       IconBook,
  'file-text':  IconFileText,
  'file':       IconFile,
  'folder':     IconFolder,
  'stack':      IconStack2,
  'bookmark':   IconBookmark,
  'hash':       IconHash,
  'news':       IconNews,
  // Media
  'camera':      IconCamera,
  'photo':       IconPhoto,
  'video':       IconVideo,
  'music':       IconMusic,
  'headphones':  IconHeadphones,
  'microphone':  IconMicrophone,
  'movie':       IconMovie,
  'tv':          IconDeviceTv,
  // Creative
  'bulb':       IconBulb,
  'palette':    IconPalette,
  'brush':      IconBrush,
  'scissors':   IconScissors,
  'wand':       IconWand,
  // Tools
  'settings':   IconSettings,
  'tool':       IconTool,
  'hammer':     IconHammer,
  'ruler':      IconRuler,
  // Discovery
  'search':   IconSearch,
  'eye':      IconEye,
  'compass':  IconCompass,
  // Misc
  'smile':      IconMoodSmile,
  'thumbs-up':  IconThumbUp,
  'coffee':     IconCoffee,
  'quote':      IconQuote,
  'plug':       IconPlug,
}

export const TABLER_NAMES: string[] = Object.keys(TABLER_LIBRARY).sort()
