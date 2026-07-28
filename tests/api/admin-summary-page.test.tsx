import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

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
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("admin summary execution status card", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
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

    render(<ExecutionStatusSummaryCard />);

    await waitFor(() => {
      expect(
        screen.getByTestId("execution-status-summary-card"),
      ).toBeTruthy();
    });

    expect(screen.getByText("Neejee Activation Sprint")).toBeTruthy();
    expect(screen.getByText("In progress")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();

    const link = screen.getByRole("link", { name: "View detail" });
    expect(link.getAttribute("href")).toBe("/admin/execution-status/pilot-123");
  });

  it("renders an unavailable state when the endpoint fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    } as Response);

    render(<ExecutionStatusSummaryCard />);

    await waitFor(() => {
      expect(
        screen.getByTestId("execution-status-summary-card-unavailable"),
      ).toBeTruthy();
    });

    expect(
      screen.getByText(/Request failed with status 404/i),
    ).toBeTruthy();
  });

  it("renders a loading state before data resolves", () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved
        }) as Promise<Response>,
    );

    render(<ExecutionStatusSummaryCard />);

    expect(
      screen.getByTestId("execution-status-summary-card-loading"),
    ).toBeTruthy();
  });
});