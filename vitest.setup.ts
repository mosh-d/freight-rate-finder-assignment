import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL's automatic cleanup needs a global afterEach; we run vitest without
// globals (explicit imports), so cleanup is registered here once instead.
afterEach(() => {
  cleanup();
});
