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

The reset creates 10 psychiatrists, 10 counsellors, and 10 therapists, each with a unique role-coded `DT#####` ID. Select the matching role in **Log in as**.

| Role | Login email |
| --- | --- |
| Psychiatrist | `psychiatrist.02@providers.destiny` |
| Counsellor | `counsellor.02@providers.destiny` |
| Therapist | `therapist.02@providers.destiny` |

The password for each is `Demo@1234`. Two patient accounts are also retained: `patient1@demo.destiny` and `patient2@demo.destiny`, with the same password. The final ID letter identifies the professional role: `T` therapist, `C` counsellor, `P` psychiatrist.

## Booking and report sharing

Patients choose an available appointment time, then enter their name, age, and gender. If they have a completed assessment, its report is included for the professional by default; patients can uncheck the sharing option before confirming. The selected professional can view only the report attached to their appointment. If there is no completed assessment, only the appointment details are shared.

The application transactionally reserves each slot to prevent two patients from booking it at once.

## Email notifications

Assessment completion and appointment booking create confirmation emails. With no SMTP settings, the app writes an HTML preview to `.mail-previews/` and reports that it was not delivered. To deliver emails, set these values in your private `.env` file:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
MAIL_FROM=Destiny <no-reply@example.com>
```

Use the host, port, TLS mode, and credentials provided by your email provider. Do not commit `.env` or real credentials. Email delivery problems are logged and shown as a notification; they do not undo a saved assessment or confirmed booking. Assessment emails link to the private, sign-in-protected report and do not include answers or scores.

## Conducting a session

1. Sign in with the appropriate professional role and open **Upcoming sessions** in the workspace.
2. Review the appointment details and any assessment report the patient chose to share.
3. Arrange the real-time conversation with the patient separately using a secure video or in-person service. Destiny’s session room does **not** provide a remote connection; its camera and microphone preview is local to the current browser.
4. The session room opens from 10 minutes before the appointment until 15 minutes after its start. Either participant may open the room, and the appointment can be marked complete within that window.
5. Psychiatrists can issue a prescription after a completed appointment. Other professional roles do not have prescription access.

## Reset local account data

To clear assessments, check-ins, appointments, prescriptions, orders, and existing email previews, while keeping two patient accounts and restoring 10 professionals per role with available future slots, run:

```powershell
pnpm db:reset-accounts
```

This command is destructive to saved account activity and removes any other registered users. It retains the medicine catalogue and creates the professional accounts listed above with the password `Demo@1234`.

## Validation

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

The build and server require PostgreSQL to be reachable.
