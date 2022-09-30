export function textMethodSignatureExtraction(signature: string): { name: string, params: string[] } {
  const words = signature.match(/[A-Za-z0-9]+/gm);
  return {
    name: words ? words[0] : '',
    params: words ? words.filter((w, i) => i !== 0) : []
  }
}