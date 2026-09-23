import { z } from 'zod';
export const createTransactionSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    amount: z.string().or(z.number()).pipe(z.coerce.number().positive('Amount must be positive')),
    currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
    date: z.string().datetime({ offset: true }).or(z.string()),
    notes: z.string().optional(),
});
export const updateTransactionSchema = createTransactionSchema.partial();
export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Name must be 50 characters or less'),
});
export const updateCategorySchema = createCategorySchema.partial();
export const createBudgetSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
});
