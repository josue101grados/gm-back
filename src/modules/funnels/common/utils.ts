export function agregateTwoObjects<T>(
  obj: T,
  previous: T = {} as T,
  avoidKeys: string[] = [],
): T {
  const res = { ...previous };
  for (const [key, value] of Object.entries(obj)) {
    if (avoidKeys.indexOf(key) >= 0) continue;
    if (res[key]) {
      if (typeof res[key] === 'object') {
        res[key] = agregateTwoObjects(value, res[key]);
      } else {
        res[key] += value;
      }
    } else {
      res[key] = value;
    }
  }
  return res;
}
