import { z } from "zod";
import type { Project } from "@/composables/articles/types";

// Define validation schema for project creation
const ProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateProjectRequest = z.infer<typeof ProjectSchema>;

export default defineEventHandler(async (event): Promise<Project> => {
  // Check user permissions
  const session = requireUserSession(event);

  if (!(await session).rights.useArticles) {
    throw createError({
      statusCode: 403,
      statusMessage: "Benutzer hat keine Berechtigung auf Projekte zuzugreifen",
    });
  }

  // Validate request body
  const result = await readValidatedBody(event, (body) =>
    ProjectSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid project data",
      data: result.error.issues,
    });
  }

  const projectData = result.data;
  const db = useDrizzle();

  try {
    // Insert new project
    const newProject = await db
      .insert(tables.projects)
      .values(projectData)
      .returning();

    if (!newProject || newProject.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create project",
      });
    }

    // Transform to match Project interface (convert null to undefined)
    const created = newProject[0]!; // Safe to use ! since we checked length above
    return {
      id: created.id,
      name: created.name,
      description: created.description ?? undefined,
    };
  } catch (error: any) {
    console.error("Error creating project:", error);

    // Check for unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ein Projekt mit diesem Namen existiert bereits",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ein Fehler ist beim Erstellen des Projekts aufgetreten",
      data: error.message,
    });
  }
});
