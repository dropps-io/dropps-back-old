export function getWordsBetweenCurlies(str: string) {
  const results: string[] = [],
    re = /{([^}]+)}/g;
  let text;
  while ((text = re.exec(str))) {
    results.push(text[1]);
  }
  return results;
}
