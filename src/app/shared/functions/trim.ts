
export function trimFunction(str: string) {
  if (str && str !== null) {
    return str.replace(/^\s+|\s+$/gm, '');
  } else {
    return str;
  }
}
