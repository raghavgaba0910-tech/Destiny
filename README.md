# Destiny

Destiny is an India-focused mental wellbeing MVP with self-reflection assessments, provider listings, appointment booking, role-specific workspaces, local session-room previews, daily check-ins, and a prescription-gated pharmacy catalogue.

> **Important:** Destiny is not a clinical, pharmacy, or emergency service. Assessments are not diagnoses, listed providers are illustrative and not verified, the session room does not connect remote participants, and pharmacy orders are not fulfilled. Do not enter real or sensitive health information.

## Requirements

- Node.js 20 LTS
- pnpm 9+ (activate with `corepack enable`)
- PostgreSQL 14+

## Local setup (Windows / PowerShell)

1. Open the project folder in VS Code and start a PowerShell terminal.
2. Create a PostgreSQL database named `destiny` if you do not already have one:

   ```powershell
   psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE destiny;"
   ```

3. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Set `DATABASE_URL` in `.env` to your PostgreSQL connection. Generate an Auth.js secret with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Keep `.env` private and do not commit it.

5. Install packages and generate the Prisma client:

   ```powershell
   pnpm install
   ```

6. Apply database migrations and populate the sample catalogue and accounts:

   ```powershell
   pnpm exec prisma migrate dev
   pnpm db:seed
   ```

   `pnpm db:seed` clears existing Destiny tables before seeding. Use it only when you intend to rebuild the local application data.

7. Start the development server:

   ```powershell
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Keep the terminal open while using the app; stop the server with **Ctrl+C**.

## Sign-in accounts

The existing four accounts use the password `Demo@1234`. The therapist login created by the final reset uses the same password. Select the matching role in **Log in as**.

| Role | Email |
| --- | --- |
| Patient with three upcoming sample appointments | `patient1@demo.destiny` |
| Patient | `patient2@demo.destiny` |
| Psychiatrist | `psychiatrist@demo.destiny` |
| Counsellor | `counsellor@demo.destiny` |
| Therapist | `therapist@demo.destiny` |

Each professional sees their unique `DT` ID in their workspace and provider profile. The final letter identifies the role: `T` therapist, `C` counsellor, `P` psychiatrist.

## Booking and report sharing

Patients choose an available appointment time, then enter their name, age, and gender. If they have a completed assessment, its report is included for the professional by default; patients can uncheck the sharing option before confirming. The selected professional can view only the report attached to their appointment. If there is no completed assessment, only the appointment details are shared.

The application transactionally reserves each slot to prevent two patients from booking it at once.

## Conducting a session

1. Sign in with the appropriate professional role and open **Upcoming sessions** in the workspace.
2. Review the appointment details and any assessment report the patient chose to share.
3. Arrange the real-time conversation with the patient separately using a secure video or in-person service. Destiny’s session room does **not** provide a remote connection; its camera and microphone preview is local to the current browser.
4. The session room opens from 10 minutes before the appointment until 15 minutes after its start. Either participant may open the room, and the appointment can be marked complete within that window.
5. Psychiatrists can issue a prescription after a completed appointment. Other professional roles do not have prescription access.

## Reset local account data

To remove all non-listed accounts and clear assessments, check-ins, appointments, prescriptions, and orders, while restoring the five sign-in accounts and one upcoming sample session per professional role, run:

```powershell
pnpm db:reset-accounts
```

This preserves the medicine catalogue, keeps available appointment times, preserves existing account passwords, creates the therapist login with `Demo@1234` if needed, and removes other registered users. The command is destructive to saved account activity.

## Validation

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

The build and server require PostgreSQL to be reachable.
