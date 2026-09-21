import prisma from "../prisma/client.js";

export async function createCategory(userId: string, name: string) {
  return await prisma.category.create({
    data: { userId, name },
  });
}

export async function getCategories(userId: string) {
  return await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDefaultCategory(userId: string) {
  return await prisma.category.findFirst({
    where: { userId, isDefault: true },
  });
}

export async function updateCategory(userId: string, categoryId: string, name: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Category not found");
  }

  if (category.isDefault) {
    throw new Error("Cannot rename the default Uncategorized category");
  }

  return await prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Category not found");
  }

  if (category.isDefault) {
    throw new Error("Cannot delete the default Uncategorized category");
  }

  const uncategorized = await getDefaultCategory(userId);
  if (!uncategorized) {
    throw new Error("Default category not found");
  }

  return await prisma.$transaction(async (tx) => {
    // Reassign transactions to Uncategorized
    await tx.transaction.updateMany({
      where: { categoryId },
      data: { categoryId: uncategorized.id },
    });

    // Delete the category
    await tx.category.delete({
      where: { id: categoryId },
    });
  });
}
