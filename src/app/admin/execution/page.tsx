import React from "react";
import Link from "next/link";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

async function loadExecutionStatusDraft() {
  const storedDraft = await Promise.resolve(getExecutionStatusDraft());

  if (storedDraft) {
    return storedDraft;
  }

  return await Promise.resolve(generateExecutionStatusDraft({}));
}

function countItems(items: unknown) {
  return Array.isArray(items) ? items.filter(Boolean).length : 0;
}

export default async function ExecutionPage() {
  const executionStatusDraft = await loadExecutionStatusDraft();

  const completedCount = countItems(executionStatusDraft.completedItems);
  const inProgressCount = countItems(executionStatusDraft.inProgressItems);
  const blockedCount = countItems(executionStatusDraft.blockedItems);
  const upcomingCount = countItems(executionStatusDraft.upcomingItems);
  const detailHref = `/admin/execution-status/${executionStatusDraft.pilotId}`;

  return (
    <main>
      <header>
        <h1>Execution</h1>
        <p>Track launch readiness and execution progress across the pilot workspace.</p>
      </header>

      <section>
        <h2>Execution status</h2>
        <p>{executionStatusDraft.campaignName}</p>
        <p>{executionStatusDraft.overallStatus}</p>

        <dl>
          <div>
            <dt>Completed</dt>
            <dd>{completedCount}</dd>
          </div>
          <div>
            <dt>In progress</dt>
            <dd>{inProgressCount}</dd>
          </div>
          <div>
            <dt>Blocked</dt>
            <dd>{blockedCount}</dd>
          </div>
          <div>
            <dt>Upcoming</dt>
            <dd>{upcomingCount}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{executionStatusDraft.lastUpdatedAt}</dd>
          </div>
        </dl>

        <Link href={detailHref}>Open execution status draft</Link>
      </section>
    </main>
  );
}