import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

type MarketplaceRequestRow = {
  id: string;
  service_slug: string;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  website: string | null;
  budget_range: string | null;
  brief: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  assigned_specialist_id?: string | null;
  assigned_specialist_slug?: string | null;
  assigned_specialist_name?: string | null;
};

type MarketplaceProposalRow = {
  id: string;
  request_id: string;
  specialist_id: string | null;
  specialist_slug: string | null;
  specialist_name: string | null;
  title: string;
  scope_summary: string;
  deliverables: string[];
  price_inr: number;
  timeline_days: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type MarketplaceEventRow = {
  id: string;
  request_id: string;
  proposal_id: string | null;
  event_type: string;
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type MarketplaceSpecialistRow = {
  id: string;
  slug: string;
  full_name: string;
  active: boolean;
};

type MockState = {
  tick: number;
  requests: MarketplaceRequestRow[];
  proposals: MarketplaceProposalRow[];
  events: MarketplaceEventRow[];
  specialists: MarketplaceSpecialistRow[];
};

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const PROPOSAL_ID = "22222222-2222-4222-8222-222222222222";
const SIBLING_PROPOSAL_ID = "33333333-3333-4333-8333-333333333333";
const SPECIALIST_ID = "44444444-4444-4444-8444-444444444444";

let currentState: MockState;
let requestsRoute: typeof import("@/app/api/admin/marketplace/requests/route");
let proposalsRoute: typeof import("@/app/api/admin/marketplace/proposals/route");
let eventsRoute: typeof import("@/app/api/admin/marketplace/events/route");

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nextIso(state: MockState): string {
  state.tick += 1;
  return new Date(Date.UTC(2026, 6, 25, 7, 0, 0, state.tick)).toISOString();
}

function makeState(overrides?: Partial<MockState>): MockState {
  return {
    tick: 0,
    requests: [],
    proposals: [],
    events: [],
    specialists: [],
    ...overrides,
  };
}

function getTable(state: MockState, table: string): any[] {
  switch (table) {
    case "marketplace_requests":
      return state.requests;
    case "marketplace_proposals":
      return state.proposals;
    case "marketplace_request_events":
      return state.events;
    case "marketplace_specialists":
      return state.specialists;
    default:
      throw new Error(`Unsupported table: ${table}`);
  }
}

function rowMatches(row: Record<string, any>, filters: Array<{ kind: "eq" | "neq" | "in"; field: string; value: any }>) {
  return filters.every((filter) => {
    if (filter.kind === "eq") return row[filter.field] === filter.value;
    if (filter.kind === "neq") return row[filter.field] !== filter.value;
    if (filter.kind === "in") return Array.isArray(filter.value) && filter.value.includes(row[filter.field]);
    return false;
  });
}

function normalizeInsertedRow(state: MockState, table: string, row: Record<string, any>) {
  const base = clone(row);

  if (!base.id) {
    base.id = crypto.randomUUID();
  }

  if (table === "marketplace_request_events") {
    if (!base.created_at) {
      base.created_at = nextIso(state);
    }
    return base;
  }

  if (!base.created_at) {
    base.created_at = nextIso(state);
  }

  if (!base.updated_at) {
    base.updated_at = base.created_at;
  }

  return base;
}

class SupabaseQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private filters: Array<{ kind: "eq" | "neq" | "in"; field: string; value: any }> = [];
  private action: "select" | "update" | "insert" = "select";
  private updatePayload: Record<string, any> | null = null;
  private insertPayload: Record<string, any>[] = [];
  private orderField: string | null = null;
  private ascending = true;
  private limitCount: number | null = null;

  constructor(private state: MockState, private table: string) {}

  select(_columns?: string) {
    return this;
  }

  update(payload: Record<string, any>) {
    this.action = "update";
    this.updatePayload = payload;
    return this;
  }

  insert(payload: Record<string, any> | Record<string, any>[]) {
    this.action = "insert";
    this.insertPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ kind: "eq", field, value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ kind: "neq", field, value });
    return this;
  }

  in(field: string, value: any[]) {
    this.filters.push({ kind: "in", field, value });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.ascending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return Promise.resolve(this.execute());
  }

  maybeSingle() {
    const result = this.execute();
    const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
    return Promise.resolve({ data: rows[0] ?? null, error: result.error });
  }

  single() {
    const result = this.execute();
    const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
    return Promise.resolve({ data: rows[0] ?? null, error: result.error });
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected as any);
  }

  private execute() {
    if (this.action === "insert") {
      const table = getTable(this.state, this.table);
      const inserted = this.insertPayload.map((row) => normalizeInsertedRow(this.state, this.table, row));
      table.push(...inserted);
      return {
        data: inserted.length === 1 ? clone(inserted[0]) : clone(inserted),
        error: null,
      };
    }

    const table = getTable(this.state, this.table);
    const matched = table.filter((row) => rowMatches(row, this.filters));

    if (this.action === "update") {
      const updated = matched.map((row) => {
        Object.assign(row, clone(this.updatePayload ?? {}));
        return clone(row);
      });

      return { data: updated, error: null };
    }

    let rows = matched.map((row) => clone(row));

    if (this.orderField) {
      rows.sort((a, b) => {
        const left = a[this.orderField!];
        const right = b[this.orderField!];
        if (left === right) return 0;
        if (this.ascending) return left > right ? 1 : -1;
        return left < right ? 1 : -1;
      });
    }

    if (typeof this.limitCount === "number") {
      rows = rows.slice(0, this.limitCount);
    }

    return { data: rows, error: null };
  }
}

function createSupabaseMock(state: MockState) {
  return {
    from(table: string) {
      return new SupabaseQueryBuilder(state, table);
    },
  };
}

function makeJsonRequest(url: string, method: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      "x-admin-secret": "test-admin-secret",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(async () => {
  currentState = makeState();

  vi.resetModules();

  vi.doMock("@/lib/admin-route", () => ({
    requireAdmin: vi.fn(() => null),
  }));

  vi.doMock("@/lib/supabase/admin", () => ({
    createSupabaseAdminClient: vi.fn(() => createSupabaseMock(currentState)),
  }));

  requestsRoute = await import("@/app/api/admin/marketplace/requests/route");
  proposalsRoute = await import("@/app/api/admin/marketplace/proposals/route");
  eventsRoute = await import("@/app/api/admin/marketplace/events/route");
});

describe("admin marketplace lifecycle", () => {
  it("writes request_status_changed when a request is updated", async () => {
    currentState.requests = [
      {
        id: REQUEST_ID,
        service_slug: "seo-audit",
        full_name: "Arun Kumar",
        email: "arun@example.com",
        company_name: "Neejee",
        phone: null,
        website: "https://neejee.com",
        budget_range: "₹50,000 - ₹1,00,000",
        brief: "Need an SEO audit and 90-day action plan.",
        status: "submitted",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
        assigned_specialist_id: null,
        assigned_specialist_slug: null,
        assigned_specialist_name: null,
      },
    ];

    const response = await requestsRoute.PUT(
      makeJsonRequest("http://localhost/api/admin/marketplace/requests", "PUT", {
        id: REQUEST_ID,
        status: "reviewing",
        specialistSlug: null,
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.request.status).toBe("reviewing");

    const eventsResponse = await eventsRoute.GET(
      makeJsonRequest(`http://localhost/api/admin/marketplace/events?requestId=${REQUEST_ID}`, "GET"),
    );

    const eventsBody = await eventsResponse.json();
    const eventTypes = eventsBody.events.map((event: MarketplaceEventRow) => event.event_type);

    expect(eventTypes).toContain("request_status_changed");
  });

  it("creates a proposal and writes proposal_created plus request_status_changed", async () => {
    currentState.requests = [
      {
        id: REQUEST_ID,
        service_slug: "seo-audit",
        full_name: "Arun Kumar",
        email: "arun@example.com",
        company_name: "Neejee",
        phone: null,
        website: "https://neejee.com",
        budget_range: "₹50,000 - ₹1,00,000",
        brief: "Need an SEO audit and 90-day action plan.",
        status: "reviewing",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
        assigned_specialist_id: null,
        assigned_specialist_slug: null,
        assigned_specialist_name: null,
      },
    ];

    const response = await proposalsRoute.POST(
      makeJsonRequest("http://localhost/api/admin/marketplace/proposals", "POST", {
        requestId: REQUEST_ID,
        specialistSlug: null,
        title: "Smoke Proposal",
        scopeSummary: "Temporary smoke proposal used to verify proposal creation and event persistence.",
        deliverables: ["Discovery summary", "Delivery plan"],
        priceInr: 25000,
        timelineDays: 7,
        notes: "Temporary admin smoke test proposal.",
      }),
    );

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.proposal.title).toBe("Smoke Proposal");
    expect(currentState.requests[0].status).toBe("proposed");

    const proposalId = body.proposal.id as string;

    const requestEventsResponse = await eventsRoute.GET(
      makeJsonRequest(`http://localhost/api/admin/marketplace/events?requestId=${REQUEST_ID}`, "GET"),
    );

    const requestEventsBody = await requestEventsResponse.json();
    const requestEventTypes = requestEventsBody.events.map((event: MarketplaceEventRow) => event.event_type);

    expect(requestEventTypes).toContain("proposal_created");
    expect(requestEventTypes).toContain("request_status_changed");

    const proposalEventsResponse = await eventsRoute.GET(
      makeJsonRequest(`http://localhost/api/admin/marketplace/events?proposalId=${proposalId}`, "GET"),
    );

    const proposalEventsBody = await proposalEventsResponse.json();
    const proposalEventTypes = proposalEventsBody.events.map((event: MarketplaceEventRow) => event.event_type);

    expect(proposalEventTypes).toContain("proposal_created");
    expect(proposalEventTypes).toContain("request_status_changed");
  });

  it("rejects the final open proposal and closes the request", async () => {
    currentState.requests = [
      {
        id: REQUEST_ID,
        service_slug: "seo-audit",
        full_name: "Arun Kumar",
        email: "arun@example.com",
        company_name: "Neejee",
        phone: null,
        website: "https://neejee.com",
        budget_range: "₹50,000 - ₹1,00,000",
        brief: "Need an SEO audit and 90-day action plan.",
        status: "proposed",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
        assigned_specialist_id: null,
        assigned_specialist_slug: null,
        assigned_specialist_name: null,
      },
    ];

    currentState.proposals = [
      {
        id: PROPOSAL_ID,
        request_id: REQUEST_ID,
        specialist_id: null,
        specialist_slug: null,
        specialist_name: null,
        title: "Last Open Proposal",
        scope_summary: "A pending proposal that will be rejected.",
        deliverables: ["Audit"],
        price_inr: 15000,
        timeline_days: 5,
        notes: null,
        status: "sent",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
      },
    ];

    const response = await proposalsRoute.PUT(
      makeJsonRequest("http://localhost/api/admin/marketplace/proposals", "PUT", {
        id: PROPOSAL_ID,
        status: "rejected",
        notes: "Closing temporary smoke proposal after verification.",
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.proposal.status).toBe("rejected");
    expect(currentState.requests[0].status).toBe("closed");

    const proposalEventsResponse = await eventsRoute.GET(
      makeJsonRequest(`http://localhost/api/admin/marketplace/events?proposalId=${PROPOSAL_ID}`, "GET"),
    );

    const proposalEventsBody = await proposalEventsResponse.json();
    const proposalEventTypes = proposalEventsBody.events.map((event: MarketplaceEventRow) => event.event_type);

    expect(proposalEventTypes).toContain("proposal_status_changed");
    expect(proposalEventTypes).toContain("request_closed");
  });

  it("accepts a proposal, rejects siblings, and assigns the request", async () => {
    currentState.requests = [
      {
        id: REQUEST_ID,
        service_slug: "seo-audit",
        full_name: "Arun Kumar",
        email: "arun@example.com",
        company_name: "Neejee",
        phone: null,
        website: "https://neejee.com",
        budget_range: "₹50,000 - ₹1,00,000",
        brief: "Need an SEO audit and 90-day action plan.",
        status: "proposed",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
        assigned_specialist_id: null,
        assigned_specialist_slug: null,
        assigned_specialist_name: null,
      },
    ];

    currentState.proposals = [
      {
        id: PROPOSAL_ID,
        request_id: REQUEST_ID,
        specialist_id: SPECIALIST_ID,
        specialist_slug: "growth-ops-partner",
        specialist_name: "Growth Ops Partner",
        title: "Winning Proposal",
        scope_summary: "This proposal will be accepted.",
        deliverables: ["Discovery", "Plan"],
        price_inr: 30000,
        timeline_days: 10,
        notes: null,
        status: "sent",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
      },
      {
        id: SIBLING_PROPOSAL_ID,
        request_id: REQUEST_ID,
        specialist_id: null,
        specialist_slug: null,
        specialist_name: null,
        title: "Sibling Proposal",
        scope_summary: "This sibling proposal should be rejected automatically.",
        deliverables: ["Alt plan"],
        price_inr: 28000,
        timeline_days: 9,
        notes: null,
        status: "sent",
        created_at: nextIso(currentState),
        updated_at: nextIso(currentState),
      },
    ];

    const response = await proposalsRoute.PUT(
      makeJsonRequest("http://localhost/api/admin/marketplace/proposals", "PUT", {
        id: PROPOSAL_ID,
        status: "accepted",
        notes: "Accepting winning proposal.",
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.proposal.status).toBe("accepted");

    const sibling = currentState.proposals.find((proposal) => proposal.id === SIBLING_PROPOSAL_ID);
    expect(sibling?.status).toBe("rejected");

    expect(currentState.requests[0].status).toBe("assigned");
    expect(currentState.requests[0].assigned_specialist_slug).toBe("growth-ops-partner");
    expect(currentState.requests[0].assigned_specialist_name).toBe("Growth Ops Partner");

    const requestEventsResponse = await eventsRoute.GET(
      makeJsonRequest(`http://localhost/api/admin/marketplace/events?requestId=${REQUEST_ID}`, "GET"),
    );

    const requestEventsBody = await requestEventsResponse.json();
    const requestEventTypes = requestEventsBody.events.map((event: MarketplaceEventRow) => event.event_type);

    expect(requestEventTypes).toContain("proposal_status_changed");
    expect(requestEventTypes).toContain("request_assigned");
  });
});