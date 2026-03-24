declare module "*.jsx" {
  import type { ComponentType } from "react";

  const Component: ComponentType<Record<string, never>>;
  export default Component;
}
