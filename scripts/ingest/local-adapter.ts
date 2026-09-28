import { loadContent } from "../content-schema";
import type { SourceAdapter } from "./index";

/** Reads hand-curated comics from content/comics/*.json in this repo. */
export const localAdapter: SourceAdapter = {
  name: "local",
  async load() {
    return loadContent();
  },
};
