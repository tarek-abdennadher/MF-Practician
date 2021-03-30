import { SVG, VALIDFILEEXTENSIONS, PDF, VALIDIMAGEEXTENSIONS } from "../Constants";

export const checkIsValidImageExtensions = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");
  const extension = fileName.substring(dotIndex + 1, fileName.length);
  return {isValid: VALIDFILEEXTENSIONS.includes(extension.toLowerCase()),isImage: VALIDIMAGEEXTENSIONS.includes(extension.toLowerCase()), isSvg: extension.toLowerCase() == SVG, isPdf: extension.toLowerCase() == PDF};
};
