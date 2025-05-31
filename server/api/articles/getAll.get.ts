import type { Connector, Type, Tags } from "@/composables/articles/types";

type APIReturnType = {
  projectName: string;
  locationName: string;
  number: string;
  length: number;
  storageLocation: string;
  storageLocationSection: number;
  type: Type;
  connector: Connector;
  outputs: Partial<Record<Connector, number>>;
  tags: Tags[];
};

export default defineCachedEventHandler(
  async (event): Promise<APIReturnType[]> => {
    const session = requireUserSession(event);

    if (!(await session).rights.useArticles) {
      throw createError({
        statusCode: 403,
        statusMessage: "User does not have permission to access articles",
      });
    }

    try {
      const db = useDrizzle();

      const result = await db.query.articles.findMany({
        columns: {
          id: true,
          lengthInMeter: true,
          storageLocationSection: true,
          type: true,
          connector: true,
          outputs: true,
          tags: true,
          updatedAt: false,
          createdAt: false,
          currentProjectId: false,
        },
        with: {
          storageLocation: {
            columns: {
              name: true,
            },
          },
          project: {
            columns: {
              name: true,
            },
          },
        },
      });

      // Map DB result to APIReturnType
      return (result ?? []).map(
        (row: any) =>
          ({
            projectName: row.project?.name ?? "",
            locationName: row.storageLocation?.name ?? "",
            number: row.id,
            length: row.lengthInMeter,
            storageLocation: row.storageLocation?.name ?? "",
            storageLocationSection: row.storageLocationSection,
            type: row.type,
            connector: row.connector,
            outputs: row.outputs,
            tags: row.tags,
          }) as APIReturnType,
      );
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch articles",
      });
    }
  },
  { maxAge: 120 }, // cache for 2 minutes (120 seconds)
);
