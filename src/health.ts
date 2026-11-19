export interface Health {
  status: "ok";
  name: string;
  version: string;
}

/**
 * Minimal liveness information for the app.
 * Placeholder module so the toolchain (lint, typecheck, tests, CI) has something real to check.
 */
export function getHealth(name: string, version: string): Health {
  if (name.trim() === "" || version.trim() === "") {
    throw new Error("name and version are required");
  }
  return { status: "ok", name, version };
}
