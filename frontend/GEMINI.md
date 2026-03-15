# Pickolo Project Mandates

This file defines the foundational protocols for all engineering tasks in the Pickolo project. The AI agent MUST follow these instructions automatically.

## Project-Level Skills

### 1. `pickolo-integrity-guard` (The Testing Skill)
**Trigger:** Before any implementation and after every code change.
**Workflow:**
1.  Run `npm run build` to ensure no regression in types or build configuration.
2.  Perform a "Route Health Check" using `curl` on critical endpoints: `/`, `/facilities`, `/schedule`.
3.  Verify that the rebranding (Pickolo branding, green logo) is still intact.
4.  **Requirement:** If this skill fails, all other tasks are secondary to fixing the break.

### 2. `pickolo-feature-sync` (The Documentation Skill)
**Trigger:** After every successful verification of a new feature.
**Workflow:**
1.  Update `PROJECT_LOG.md` with the new functionality.
2.  Add corresponding unit test case requirements for the new feature.
3.  Log the date and status of the feature.

## Development Lifecycle
- **Step 1:** Research existing implementation.
- **Step 2:** Invoke `pickolo-integrity-guard` to confirm current state is green.
- **Step 3:** Implement changes.
- **Step 4:** Invoke `pickolo-integrity-guard` to verify the fix/feature.
- **Step 5:** Invoke `pickolo-feature-sync` to update the project history.
- **Step 6:** Prepare changes for Git commit.
