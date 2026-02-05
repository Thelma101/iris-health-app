export const pagination = (page = 1, limit = 20) => {
  const take = Math.max(1, Math.min(limit, 100));
  const skip = Math.max(0, (page - 1) * take);
  return { skip, take };
};
