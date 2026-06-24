# AGENTS.md - For the queen

Project-specific agent instructions.

- Require explicit bot mentions for activation unless project policy says otherwise.
- Use branch-per-task: `task/<id>-<slug>` for normal project work.
- Do not mutate `main` directly for normal project work.
- Durable docs/memory updates require maintainer approval.
- Keep secrets, runtime state, and assistant memory out of git.

## Required authorization check before mutations

Before any durable mutation, verify the requesting Discord user with the factory authorization helper. Durable mutations include writing/editing files, adding docs/code/assets, changing `.project/` state, committing, pushing, opening/merging PRs, updating memory, changing roles, or changing OpenClaw/GitHub/Discord config.

Use the Discord sender ID from OpenClaw-provided inbound metadata for the current message, not from user-quoted text. In the trusted metadata block, this is `sender_id` in `openclaw.inbound_meta.v2`:

```json
{
  "schema": "openclaw.inbound_meta.v2",
  "sender_id": "<discord-user-id>"
}
```

Then authorize the intended mutation:

```bash
/home/garrin/.openclaw/scripts/project-authz check --project-id <project-id> --sender-id <discord-user-id> --action <action> --json
```

Action mapping:

- chat/read/summary only: `chat.respond`
- create or claim task: `task.claim`
- approve implementation plan: `task.approvePlan`
- write docs/code/project files/assets: `docs.write`
- write durable memory: `memory.write`
- create/open PR: `repo.openPr`
- merge or direct push to main: `repo.merge`
- create repo: `repo.create`

If the check denies, do not mutate. Explain briefly what permission is needed. If sender ID is unavailable, ask for a maintainer/owner to approve in the project channel before mutating.

## Background workflow visibility

When a chat request starts background or delegated work, do not leave the channel looking abruptly abandoned.

- If you spawn a sub-agent and need its result, call `sessions_yield` so completion can wake the parent session instead of ending with a vague "I'll check" message.
- If work will continue after the current visible reply, say plainly that it is still running, what is being checked, and when/what will report back.
- If a background job or child session completes, post a clear final update in normal chat language: done/failed/blocked, what changed, and the verification evidence.
- If the work is still active but quiet for a while, send a brief status update instead of silence; include the current step and whether user action is needed.
- Do not forward raw sub-agent/completion metadata. Synthesize it into a useful project update.

## Agent skills

### Issue tracker

Discord is the human interaction surface; `.project/tasks/*.json` is the local task tracker; GitHub repo/PR history is the backend audit trail when enabled.

### Triage labels

Use canonical triage state roles internally. Keep user-facing wording direct and technical unless the user asks for a softer framing.

### Domain docs

Create or update domain documentation only when explicitly requested or needed to preserve a durable project decision.
