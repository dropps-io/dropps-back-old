export function splitToChunks(array: any[], parts: number) {
  const result: any[] = [];
  for (let i = parts; i > 0; i--) {
    result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}
