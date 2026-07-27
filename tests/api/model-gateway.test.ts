import { beforeEach, describe, expect, it } from "vitest";

import {
  executeModelGateway,
  getTenantCostLedger,
  resetModelGatewayState,
  type ModelGatewayRequest,
  type ModelGatewayResponse,
} from "@/lib/ai/model-gateway";

describe("model gateway", () => {
  beforeEach(() => {
    resetModelGatewayState();
  });

  it("returns a provider response and records tenant cost", async () => {
    const request: ModelGatewayRequest = {
      tenantId: "oye-imagine",
      pilotId: "neejee-pilot",
      taskType: "strategy-generation",
      prompt: "Generate a structured strategy brief",
      maxCostUsd: 1,
    };

    const response = await executeModelGateway(request, async () => {
      const result: ModelGatewayResponse = {
        ok: true,
        provider: "openai",
        content: '{"summary":"ok"}',
        promptTokens: 120,
        completionTokens: 80,
        estimatedCostUsd: 0.002,
        cacheHit: false,
        fallbackUsed: false,
      };

      return result;
    });

    expect(response.ok).toBe(true);
    expect(response.provider).toBe("openai");
    expect(response.cacheHit).toBe(false);

    const ledger = getTenantCostLedger("oye-imagine");
    expect(ledger.spentUsd).toBe(0.002);
  });

  it("returns cached response on repeated requests", async () => {
    const request: ModelGatewayRequest = {
      tenantId: "oye-imagine",
      pilotId: "neejee-pilot",
      taskType: "strategy-generation",
      prompt: "Generate a structured strategy brief",
    };

    let invocationCount = 0;

    const provider = async () => {
      invocationCount += 1;

      return {
        ok: true,
        provider: "anthropic" as const,
        content: "cached-result",
        promptTokens: 100,
        completionTokens: 50,
        estimatedCostUsd: 0.0015,
        cacheHit: false,
        fallbackUsed: false,
      };
    };

    const first = await executeModelGateway(request, provider);
    const second = await executeModelGateway(request, provider);

    expect(first.cacheHit).toBe(false);
    expect(second.cacheHit).toBe(true);
    expect(second.content).toBe("cached-result");
    expect(invocationCount).toBe(1);
  });

  it("throws when estimated cost exceeds the cap", async () => {
    const request: ModelGatewayRequest = {
      tenantId: "oye-imagine",
      pilotId: "neejee-pilot",
      taskType: "strategy-generation",
      prompt: "Generate a structured strategy brief",
      maxCostUsd: 0.0001,
    };

    await expect(
      executeModelGateway(request, async () => ({
        ok: true,
        provider: "openai",
        content: "too-expensive",
        promptTokens: 300,
        completionTokens: 300,
        estimatedCostUsd: 0.01,
        cacheHit: false,
        fallbackUsed: false,
      })),
    ).rejects.toThrow("Model gateway cost cap exceeded");
  });

  it("uses the default rule-based provider when no provider is supplied", async () => {
    const response = await executeModelGateway({
      tenantId: "oye-imagine",
      pilotId: "neejee-pilot",
      taskType: "strategy-generation",
      prompt: "Generate strategy output",
    });

    expect(response.ok).toBe(true);
    expect(response.provider).toBe("rule-based");
    expect(response.content).toContain("RULE-BASED RESPONSE");
  });
});