// Lets plain tsc type .astro imports in tests (the Astro editor plugin resolves them itself)
declare module "*.astro" {
  const Component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default Component;
}
