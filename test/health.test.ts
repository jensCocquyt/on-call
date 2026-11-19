import { describe, expect, it } from "vitest";
import { getHealth } from "../src/health.js";

describe("getHealth", () => {
  it("returns ok with name and version", () => {
    expect(getHealth("on-call-copilot", "0.1.0")).toEqual({
      status: "ok",
      name: "on-call-copilot",
      version: "0.1.0",
    });
  });

  it("rejects empty values", () => {
    expect(() => getHealth("", "0.1.0")).toThrow();
  });
});
