import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Right } from "@/composables/articles/types";

const UpdateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  jobtitle: z.string().max(200).optional(),
  rights: z
    .array(
      z.enum([
        "useArticles",
        "editArticles",
        "addArticles",
        "removeArticles",
        "admin",
      ] as const),
    )
    .optional(),
});

export default defineEventHandler(async (event) => {
  // Check admin permissions
  const session = await requireUserSession(event);

  if (!session.rights.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const userId = getRouterParam(event, "userId");

  if (!userId || isNaN(Number(userId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID",
    });
  }

  // Prevent users from modifying themselves to avoid lockout
  if (Number(userId) === session.user.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot modify your own permissions to prevent lockout",
    });
  }

  const body = await readBody(event);

  try {
    const validatedData = UpdateUserSchema.parse(body);

    const db = useDrizzle();

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(tables.users.id, Number(userId)),
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Prepare update data
    const updateData: Partial<typeof tables.users.$inferInsert> = {};
    if (validatedData.firstName !== undefined) {
      updateData.firstName = validatedData.firstName;
    }
    if (validatedData.lastName !== undefined) {
      updateData.lastName = validatedData.lastName;
    }
    if (validatedData.jobtitle !== undefined) {
      updateData.jobtitle = validatedData.jobtitle;
    }
    if (validatedData.rights !== undefined) {
      updateData.rights = validatedData.rights as Right[];

      // Validate that at least one admin remains if removing admin rights
      if (!validatedData.rights.includes("admin")) {
        const allUsers = await db.query.users.findMany({
          columns: { id: true, rights: true },
        });

        const remainingAdmins = allUsers.filter(
          (user) =>
            user.id !== Number(userId) && user.rights?.includes("admin"),
        );

        if (remainingAdmins.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage:
              "Cannot remove admin rights - at least one admin must remain",
          });
        }
      }
    }

    // Perform update
    const updatedUsers = await db
      .update(tables.users)
      .set(updateData)
      .where(eq(tables.users.id, Number(userId)))
      .returning();

    if (!updatedUsers || updatedUsers.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Update failed",
      });
    }

    const updatedUser = updatedUsers[0]!;

    console.log(
      `Admin API: Updated user ${updatedUser.mail} (ID: ${updatedUser.id}) by ${session.user.mail}`,
    );

    return {
      success: true,
      user: {
        id: updatedUser.id,
        microsoftID: updatedUser.microsoftID,
        mail: updatedUser.mail,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        jobtitle: updatedUser.jobtitle,
        rights: updatedUser.rights,
      },
      message: "User updated successfully",
      changes: Object.keys(updateData),
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid user data",
        data: error.errors,
      });
    }

    // Re-throw createError instances
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Admin API - Error updating user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating user",
    });
  }
});
