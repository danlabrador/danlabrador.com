import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/**
 * Wraps a server action: enforces admin auth, parses input with the given
 * schema, and returns a structured result object callers can render into
 * the UI without try/catch boilerplate.
 */
export function adminAction<TSchema extends z.ZodTypeAny, TResult>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<TResult>,
) {
  return async (raw: z.infer<TSchema>): Promise<ActionResult<TResult>> => {
    await requireAdmin();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return fail("Invalid input", flat.fieldErrors as Record<string, string[]>);
    }
    try {
      const result = await handler(parsed.data);
      return ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      return fail(message);
    }
  };
}
