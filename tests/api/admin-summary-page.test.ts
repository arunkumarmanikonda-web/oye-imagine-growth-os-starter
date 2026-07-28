/** @vitest-environment jsdom */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ExecutionStatusSummaryCard } from "@/app/admin/summary/execution-status-summary-card";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      "a",
      { href, className },
      children,
    ),
}));

async function flushUi() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("admin summary execution status card", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });

    container.remove();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders execution-status summary from the summary endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        pilotId: "pilot-123",
        campaignName: "Neejee Activation Sprint",
        overallStatus: "In progress",
        completedCount: 3,
        inProgressCount: 2,
        blockedCount: 1,
        upcomingCount: 4,
        lastUpdatedAt: "2026-01-02T10:30:00.000Z",
        detailHref: "/admin/execution-status/pilot-123",
      }),
    } as Response);

    await act(async () => {
      root.render(React.createElement(ExecutionStatusSummaryCard));
      await flushUi();
    });

    expect(
      container.querySelector('[data-testid="execution-status-summary-card"]')
    ).toBeTruthy();

    expect(container.textContent).toContain("Neejee Activation Sprint");
    expect(container.textContent).toContain("In progress");
    expect(container.textContent).toContain("3");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("4");

    const link = container.querySelector('a[href="/admin/execution-status/pilot-123"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("View detail");
  });

  it("renders an unavailable state when the endpoint fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    } as Response);

    await act(async () => {
      root.render(React.createElement(ExecutionStatusSummaryCard));
      await flushUi();
    });

    expect(
      container.querySelector('[data-testid="execution-status-summary-card-unavailable"]')
    ).toBeTruthy();

    expect(container.textContent).toMatch(/Request failed with status 404/i);
  });

  it("renders a loading state before data resolves", async () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved
        }) as Promise<Response>
    );

    await act(async () => {
      root.render(React.createElement(ExecutionStatusSummaryCard));
    });

    expect(
      container.querySelector('[data-testid="execution-status-summary-card-loading"]')
    ).toBeTruthy();
  });
});