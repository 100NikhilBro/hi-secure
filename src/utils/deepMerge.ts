export function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!source) return target;

  const output: any = Array.isArray(target) ? [...(target as any)] : { ...(target as any) };

  for (const key of Object.keys(source) as Array<keyof typeof source>) {
    const sourceValue = (source as any)[key];
    const targetValue = (target as any)[key];

    const shouldRecurse =
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object";

    if (shouldRecurse) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }

  return output;
}
