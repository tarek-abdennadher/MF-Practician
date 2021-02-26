import { SVG, VALIDFILEEXTENSIONS } from "../Constants";

export const checkIsValidImageExtensions = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");
  const extension = fileName.substring(dotIndex + 1, fileName.length);
  return {isValid: VALIDFILEEXTENSIONS.includes(extension.toLowerCase()), isSvg: extension.toLowerCase() == SVG};
};
