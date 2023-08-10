export const formatUid = (uid: string) => {
  return `${uid.slice(0, 5)}...${uid.slice(-4)}`;
};
