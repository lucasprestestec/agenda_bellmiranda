import {
  Camera, MessageCircle, MapPin, ArrowLeft, ArrowRight, ArrowUpRight,
  CalendarDays, Clock, User, Sparkles, Check, X, Plus, Trash2, LogOut,
  ChevronLeft, ChevronRight, Ban,
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
  clock: Clock,
  user: User,
  sparkles: Sparkles,
  check: Check,
  x: X,
  plus: Plus,
  trash: Trash2,
  'log-out': LogOut,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  ban: Ban,
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
