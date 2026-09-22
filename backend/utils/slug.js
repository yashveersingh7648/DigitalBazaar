// Naam se URL-friendly slug banata hai (jaise "Wireless Earbuds X1" -> "wireless-earbuds-x1"),
// aur agar wahi slug pehle se kisi aur product ka hai to end me ek chhota unique number jod deta hai.
export const slugify = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

export const generateUniqueSlug = async (Product, name, excludeId) => {
  const base = slugify(name) || "product";
  let candidate = base;
  let i = 1;
  while (await Product.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  return candidate;
};
