export const formatUid = (uid: string) => {
    return `${uid.slice(0, 4)}...${uid.slice(-4)}`;
  };