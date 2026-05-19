import { supabase } from "../../lib/supabase.js";
import {
  sendEnrollmentConfirmationEmail,
  sendEnrollmentEmail,
} from "../../lib/mailer.js";
import { cache } from "../../lib/chache.js";

// Get all active classes
export const getAllClasses = async (filters = {}) => {
  const cacheKey = `classes:${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);

  if (cached) return cached;

  const {
    skillLevel,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    search,
    sortBy = "created_at",
    sortOrder = "asc",
    limit = 20,
    page = 1,
  } = filters;

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);

  const offset = (safePage - 1) * safeLimit;
  const ascending = sortOrder === "asc";

  const allowedSorts = ["created_at", "price", "duration", "title"];

  let query = supabase
    .from("classes")
    .select(
      `
      id,
      title,
      description,
      duration,
      skill_level,
      price,
      what_is_included,
      schedule,
      instructor_bio,
      session_link,
      is_active,
      created_at
      `,
      { count: "exact" },
    )
    .eq("is_active", true);

  // Filters
  if (skillLevel) {
    query = query.eq("skill_level", skillLevel);
  }

  if (minPrice) {
    query = query.gte("price", Number(minPrice));
  }

  if (maxPrice) {
    query = query.lte("price", Number(maxPrice));
  }

  if (minDuration) {
    query = query.gte("duration", Number(minDuration));
  }

  if (maxDuration) {
    query = query.lte("duration", Number(maxDuration));
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  // Sorting + Pagination
  query = query
    .order(allowedSorts.includes(sortBy) ? sortBy : "created_at", { ascending })
    .range(offset, offset + safeLimit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  const result = {
    data,
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(count / safeLimit),
    },
  };

  // Cache for 60 seconds
  cache.set(cacheKey, result, 60);

  return result;
};
// Get single class by id
export const getClassById = async (id) => {
  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      id,
      title,
      description,
      duration,
      skill_level,
      price,
      what_is_included,
      schedule,
      instructor_bio,
      session_link,
      is_active,
      created_at
      `,
      { count: "exact" },
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle(); // returns null instead of throwing on 0 rows

  if (error) throw new Error(`Database error: ${error.message}`);
  return data;
};

// Create new class (admin only)
export const createClass = async (data) => {
  const { data: newClass, error } = await supabase
    .from("classes")
    .insert([
      {
        title: data.title,
        description: data.description,
        duration: data.duration,
        skill_level: data.skill_level,
        price: data.price,
        what_is_included: data.what_is_included || null,
        schedule: data.schedule || null,
        instructor_bio: data.instructor_bio || null,
        session_link: data.session_link || null,
        is_active: data.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);
  return newClass;
};

// Submit enrollment
export const createEnrollment = async (data) => {
  // 1. Check class exists
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id, title")
    .eq("id", data.preferred_class_id)
    .eq("is_active", true)
    .single();

  if (classError || !classData) {
    throw new Error("Selected class does not exist or is no longer available.");
  }

  // 2. Save enrollment
  const { data: enrollment, error } = await supabase
    .from("class_enrollments")
    .insert([
      {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        preferred_class_id: data.preferred_class_id,
        message: data.message || null,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);

  // 3. Send email — non blocking
  Promise.all([
    sendEnrollmentEmail(enrollment, classData.title),
    sendEnrollmentConfirmationEmail(enrollment, classData.title),
  ]).catch((emailError) =>
    console.error(
      "Email notification failed (enrollment still saved):",
      emailError.message,
    ),
  );

  return enrollment;
};
