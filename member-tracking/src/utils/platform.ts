export const getPlatformColor = (platform: string): string => {
  const name = platform.toLowerCase();
  if (name.includes("gitlab")) return '#fc6d26';
  if (name.includes("bitbucket")) return '#0052cc';
  return '#24292e';
};

export const getPlatformTextColor = (platform: string): string => {
  const name = platform.toLowerCase();
  if (name.includes("gitlab")) return 'text-orange-600';
  if (name.includes("bitbucket")) return 'text-blue-600';
  return 'text-gray-700';
};

export const formatProvider = (platform: string): string => {
  return platform.replace(/_/g, " ")
};