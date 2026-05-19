// utils/slugify.js
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // remove duplicate hyphens
};

export const generateSku = (name, category) => {
  const namePart = name.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  const categoryPart = category.replace(/\s+/g, "-").toUpperCase().slice(0, 4);
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 6);

  return `${categoryPart}-${namePart}-${randomPart}`;
};
