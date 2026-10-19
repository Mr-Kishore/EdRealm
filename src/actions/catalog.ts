"use server";

import { db } from "@/db";
import { skillCategories, masterSubjects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getCatalogHierarchy() {
  const categories = await db.query.skillCategories.findMany({
    where: eq(skillCategories.isActive, true),
    orderBy: (c, { asc }) => [asc(c.displayOrder), asc(c.name)],
    with: {
      subjects: {
        where: eq(masterSubjects.isActive, true),
        orderBy: (s, { asc }) => [asc(s.name)],
      },
    },
  });
  return categories;
}

export async function resolveCategory(
  categoryId?: string,
  newCategoryName?: string
): Promise<string> {
  if (categoryId && categoryId !== "OTHER") {
    return categoryId;
  }

  if (!newCategoryName || !newCategoryName.trim()) {
    throw new Error("Category name is required when selecting 'Other'");
  }

  const cleanName = newCategoryName.trim();

  // Case-insensitive lookup
  const existing = await db.query.skillCategories.findFirst({
    where: sql`LOWER(TRIM(${skillCategories.name})) = LOWER(${cleanName})`,
  });

  if (existing) {
    return existing.id;
  }

  // Insert new custom category
  const [created] = await db
    .insert(skillCategories)
    .values({
      name: cleanName,
      isCustom: true,
      isActive: true,
    })
    .returning({ id: skillCategories.id });

  return created.id;
}

export async function resolveSubject(
  categoryId: string,
  subjectId?: string,
  newSubjectName?: string
): Promise<string> {
  if (subjectId && subjectId !== "OTHER") {
    return subjectId;
  }

  if (!newSubjectName || !newSubjectName.trim()) {
    throw new Error("Subject name is required when selecting 'Other'");
  }

  const cleanName = newSubjectName.trim();

  // Case-insensitive lookup per category
  const existing = await db.query.masterSubjects.findFirst({
    where: sql`${masterSubjects.categoryId} = ${categoryId} AND LOWER(TRIM(${masterSubjects.name})) = LOWER(${cleanName})`,
  });

  if (existing) {
    return existing.id;
  }

  // Insert new custom subject
  const [created] = await db
    .insert(masterSubjects)
    .values({
      categoryId,
      name: cleanName,
      isCustom: true,
      isActive: true,
    })
    .returning({ id: masterSubjects.id });

  return created.id;
}
