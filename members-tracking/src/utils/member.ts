import { Member } from "../services/api";

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#d946ef',
]

export const getMemberDisplayName = (member: Member) => {
  return member.full_name?.trim() || 'No name';
};

export const getMemberDisplayNameWithFallback = (member: Member) => {
  return member.full_name?.trim() || member.email?.trim() || 'No name';
};

export const getMemberInitials = (member: Member) => {
  if (member.full_name) {
    const nameParts = member.full_name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  }
  if (member.email) return member.email[0].toUpperCase();
  return '';
};

export const getInitialsBackgroundColor = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }  
  return COLORS[Math.abs(hash) % COLORS.length];
};