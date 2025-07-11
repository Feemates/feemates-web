export const getInitials = (fullName: string | undefined) => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function truncateToTwoDecimals(value: number): number {
  return Math.floor(value * 100) / 100;
}
