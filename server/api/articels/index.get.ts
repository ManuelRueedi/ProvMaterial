export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const articels_get = await useDrizzle().select().from(tables.articles).all();

  return articels_get;
});
