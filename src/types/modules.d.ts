// @mapbox/rehype-prism ships no types.
declare module "@mapbox/rehype-prism" {
  import type { Plugin } from "unified";
  const rehypePrism: Plugin<[{ ignoreMissing?: boolean; alias?: Record<string, string[]> }?]>;
  export default rehypePrism;
}
