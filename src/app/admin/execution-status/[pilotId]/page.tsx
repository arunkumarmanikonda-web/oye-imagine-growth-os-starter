import { RegenerateButton } from "./regenerate-button";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

type RouteParams = {
  pilotId: string;
};

type PageProps = {
  params: Promise<RouteParams>;
};

async function loadExecutionStatusDraft(pilotId: string) {
  const storedDraft = await Promise.resolve(getExecutionStatusDraft());

  if (storedDraft && storedDraft.pilotId === pilotId) {
    return storedDraft;
  }

  return await Promise.resolve(generateExecutionStatusDraft({ pilotId }));
}

function renderListSection(
  title: string,
  items: string[] | undefined,
  emptyText: string,
) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  return (
    <section>
      <h2>{title}</h2>
      {safeItems.length > 0 ? (
        <ul>
          {safeItems.map((item) => (
            <li key={`${title}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </section>
  );
}

function renderNotes(notes: unknown) {
  if (Array.isArray(notes)) {
    const safeNotes = notes.filter(
      (note): note is string => typeof note === "string" && note.length > 0,
    );

    return safeNotes.length > 0 ? (
      <ul>
        {safeNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    ) : (
      <p>No notes available.</p>
    );
  }

  if (typeof notes === "string" && notes.length > 0) {
    return <p>{notes}</p>;
  }

  return <p>No notes available.</p>;
}

export default async function ExecutionStatusPage({ params }: PageProps) {
  const { pilotId } = await params;
  const draft = await loadExecutionStatusDraft(pilotId);

  return (
    <main>
      <header>
        <p>Execution status</p>
        <h1>{draft.campaignName}</h1>
        <p>{draft.overallStatus}</p>
        <dl>
          <div>
            <dt>Pilot ID</dt>
            <dd>{draft.pilotId}</dd>
          </div>
          <div>
            <dt>Workspace ID</dt>
            <dd>{draft.workspaceId}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{draft.status}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{draft.generatedAt}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{draft.lastUpdatedAt}</dd>
          </div>
        </dl>
        <RegenerateButton pilotId={pilotId} />
      </header>

      <section>
        <h2>Overall status</h2>
        <p>{draft.overallStatus}</p>
      </section>

      {renderListSection(
        "Completed items",
        draft.completedItems,
        "No completed items yet.",
      )}

      {renderListSection(
        "In-progress items",
        draft.inProgressItems,
        "No items currently in progress.",
      )}

      {renderListSection(
        "Blocked items",
        draft.blockedItems,
        "No blocked items.",
      )}

      {renderListSection(
        "Upcoming items",
        draft.upcomingItems,
        "No upcoming items scheduled.",
      )}

      <section>
        <h2>Notes</h2>
        {renderNotes(draft.notes)}
      </section>
    </main>
  );
}