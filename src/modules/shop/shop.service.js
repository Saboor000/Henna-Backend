import { cache } from "../../lib/chache.js";
import { supabase } from "../../lib/supabase.js";
import { generateSku, generateSlug } from "../../utils/slugify.js";

const PRODUCT_SELECT = `
  id, name, slug, short_description, description,
  price, discount_price, stock, sku, category, is_featured, is_active,
  product_images (id, image_url, is_primary, display_order),
  product_variants (id, label, value, price_modifier)
`;

// ─── Public ───────────────────────────────────────────────
export const getAllProducts = async (filters = {}) => {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const {
    category,
    minPrice,
    maxPrice,
    search,
    is_featured,
    sortBy = "created_at",
    sortOrder = "desc",
    limit = 20,
    page = 1,
  } = filters;

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100); // clamp 1–100
  const safePage = Math.max(Number(page) || 1, 1); // minimum 1
  const offset = (safePage - 1) * safeLimit;
  const ascending = sortOrder === "asc";
  const allowedSorts = ["created_at", "price", "name", "stock"];

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (category) query = query.eq("category", category);
  if (is_featured) query = query.eq("is_featured", true);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (search) query = query.ilike("name", `%${search}%`);

  query = query
    .order(allowedSorts.includes(sortBy) ? sortBy : "created_at", { ascending })
    .range(offset, offset + safeLimit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Database error: ${error.message}`);

  const result = {
    data,
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
  // 5. Store in cache (60 seconds)
  cache.set(cacheKey, result, 60);

  return result;
};

export const getProductByIdentifier = async (identifier) => {
  const isId = /^\d+$/.test(identifier);
  const field = isId ? "id" : "slug";

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq(field, identifier)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Database error: ${error.message}`);
  return data;
};

// ─── Admin ────────────────────────────────────────────────
export const createProduct = async (data) => {
  const slug = `${generateSlug(data.name)}-${Date.now()}`;
  const sku = generateSku(data.name, data.category);
  const { data: product, error } = await supabase
    .from("products")
    .insert([
      {
        name: data.name,
        slug: slug,
        description: data.description,
        short_description: data.short_description,
        price: data.price,
        discount_price: data.discount_price ?? null,
        stock: data.stock ?? 0,
        sku: sku,
        category: data.category,
        is_featured: data.is_featured ?? false,
        is_active: data.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);

  //invalidate cache
  cache.invalidate("products:");
  return product;
};

export const uploadProductImage = async (
  productId,
  file,
  isPrimary,
  displayOrder,
) => {
  const fileExt = file.originalname.split(".").pop();
  const storagePath = `${productId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  if (isPrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  const { data: image, error: dbError } = await supabase
    .from("product_images")
    .insert([
      {
        product_id: productId,
        image_url: urlData.publicUrl,
        storage_path: storagePath,
        is_primary: isPrimary ?? false,
        display_order: displayOrder ?? 0,
      },
    ])
    .select()
    .single();

  if (dbError) throw new Error(`Database error: ${dbError.message}`);
  return image;
};

export const addProductVariant = async (productId, data) => {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .single();

  if (productError || !product) throw new Error("Product not found.");

  const { data: variant, error } = await supabase
    .from("product_variants")
    .insert([
      {
        product_id: productId,
        label: data.label,
        value: data.value,
        price_modifier: data.price_modifier ?? 0,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);
  return variant;
};

export const updateProduct = async (id, data) => {
  const ALLOWED = [
    "name",
    "description",
    "short_description",
    "price",
    "discount_price",
    "stock",
    "category",
    "is_featured",
    "is_active",
  ];
  const safeUpdate = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED.includes(k)),
  );
  const { data: updated, error } = await supabase
    .from("products")
    .update(safeUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);

  //invalidate cache
  cache.invalidate("products:");
  return updated;
};

export const deactivateProduct = async (id) => {
  const { data: product, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);

  //invalidate cache
  cache.invalidate("products:");
  return product;
};
