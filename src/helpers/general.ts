export function getIdFromUrl(str: string): string {
  const url = new URL(str);

  const paths = url.pathname.substring(1).split('/');
  return paths[paths.length - 1];
}