export const normalizeRole = (role: string): string => {
  const normalized = role.toLowerCase().trim();
  if (normalized === 'organization owner') return 'owner';
  return normalized;
};

export const getRoleColor = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  switch (normalizedRole) {
    case 'owner': return '#7c3aed';
    case 'developer': return '#059669';
    case 'billing admin': return '#dc2626';
    case 'content editor': return '#2563eb';
    case 'publisher': return '#ea580c';
    case 'reviewer': return '#ca8a04';
    default: return '#6b7280';
  }
};

export const getRoleDisplayName = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  switch (normalizedRole) {
    case 'owner': return 'Owner';
    case 'developer': return 'Developer';
    case 'billing admin': return 'Billing Admin';
    case 'content editor': return 'Content Editor';
    case 'publisher': return 'Publisher';
    case 'reviewer': return 'Reviewer';
    default: return role;
  }
};

export const getRoleBadgeClasses = (role: string): string => {
  const normalizedRole = normalizeRole(role);
  switch (normalizedRole) {
    case 'owner': return 'bg-violet-100 text-violet-800';
    case 'developer': return 'bg-emerald-100 text-emerald-800';
    case 'billing admin': return 'bg-red-100 text-red-800';
    case 'content editor': return 'bg-blue-100 text-blue-800';
    case 'publisher': return 'bg-orange-100 text-orange-800';
    case 'reviewer': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};