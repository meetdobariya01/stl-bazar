// src/utils/slugUtils.js
export const createSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace special chars with -
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing -
};