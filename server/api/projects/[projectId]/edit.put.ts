import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Project } from "@/composables/articles/types";

// Define validation schema for project updates
const UpdateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>;

export default defineEventHandler(async (event): Promise<Project> => {
  // Check user permissions
  const session = requireUserSession(event);

  if (!(await session).rights.includes("useArticles")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Benutzer hat keine Berechtigung auf Projekte zuzugreifen",
    });
  }

  // Get project ID from URL parameters
  const projectId = getRouterParam(event, "projectId");

  if (!projectId || isNaN(Number(projectId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid project ID",
    });
  }

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    UpdateProjectSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid project data",
      data: result.error.issues,
    });
  }

  const updateData = result.data;
  const db = useDrizzle();

  try {
    // Check if project exists
    const existingProject = await db
      .select()
      .from(tables.projects)
      .where(eq(tables.projects.id, Number(projectId)))
      .limit(1);

    if (!existingProject || existingProject.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found",
      });
    }

    // Update project
    const updatedProject = await db
      .update(tables.projects)
      .set(updateData)
      .where(eq(tables.projects.id, Number(projectId)))
      .returning();

    if (!updatedProject || updatedProject.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update project",
      });
    }

    // Transform to match Project interface (convert null to undefined)
    const updated = updatedProject[0]!;
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description ?? undefined,
    };
  } catch (error) {
    // Handle database constraint errors
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: "A project with this name already exists",
      });
    }

    // Re-throw createError instances
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    // Handle other errors
    console.error("Error updating project:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while updating project",
    });
  }
});
