// src/utils/slugify.js

export const slugify = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    // Replace "&" with "and"
    .replace(/&/g, "and")
    // Replace any non-alphanumeric (except spaces/hyphens) with ""
    .replace(/[^a-z0-9\s-]/g, "")
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
};

// Reverse — slug થી category name શોધવા માટે (rough)
export const unslugify = (slug, allNames) => {
  if (!slug || !allNames || allNames.length === 0) return slug;
  const target = slugify(slug);
  return allNames.find(name => slugify(name) === target) || slug;
};

export default slugify;