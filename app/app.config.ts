export default defineAppConfig({
  ui: {
    toaster: {
      defaultVariants: {
        position: "top-center",
      },
    },
    navigationMenu: {
      slots: {
        root: "relative flex gap-1.5 [&>div]:min-w-0",
      },
    },
    colors: {
      primary: "green",
      neutral: "neutral",
    },
  },
});
