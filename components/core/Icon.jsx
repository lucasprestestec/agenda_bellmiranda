import {
  Camera, MessageCircle, MapPin, ArrowLeft, ArrowRight, ArrowUpRight,
  CalendarDays, Calendar, Clock, User, UserRound, Sparkles, Check, X, Plus,
  Trash2, LogOut, ChevronLeft, ChevronRight, Ban, Menu, ShieldCheck, Gem,
  HeartHandshake, Leaf, Heart, Crown, Pencil, Lock,
} from 'lucide-react';

// Lucide is the flagged substitution for the brand's (nonexistent) icon set —
// see project/readme.md → ICONOGRAPHY. Stroke overridden to 1.25 (default 2 is
// too heavy for this brand). Keep this vocabulary small.
// Lucide dropped brand marks (no Instagram glyph); Camera stands in for it.
const ICONS = {
  instagram: Camera,
  'message-circle': MessageCircle,
  'map-pin': MapPin,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'calendar-days': CalendarDays,
  calendar: Calendar,
  clock: Clock,
  user: User,
  'user-round': UserRound,
  sparkles: Sparkles,
  check: Check,
  x: X,
  plus: Plus,
  trash: Trash2,
  'trash-2': Trash2,
  'log-out': LogOut,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  ban: Ban,
  menu: Menu,
  'shield-check': ShieldCheck,
  gem: Gem,
  'heart-handshake': HeartHandshake,
  leaf: Leaf,
  heart: Heart,
  crown: Crown,
  pencil: Pencil,
  lock: Lock,
};

export function Icon({ name, size = 18, stroke = 1.25, color = 'currentColor', style }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <span style={Object.assign({ display: 'inline-flex', color, lineHeight: 0 }, style)}>
      <Cmp size={size} strokeWidth={stroke} />
    </span>
  );
}
