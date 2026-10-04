# Destiny MVP

Destiny is an India-first teletherapy journey prototype for young adults. It includes reflection assessments, a care report, sample professional profiles and bookings, a local demo session room, daily check-ins, and a prescription-gated demo pharmacy.

> **Demo only:** This application is not a clinical service(ONLY A MVP). The assessment results are not diagnoses, provider profiles are sample data, the video room is not a real telehealth connection, orders do not collect payment or deliver medicine, and the app is not suitable for storing real health information.

## Requirements

- Node.js 20 LTS (Node 18.18 or newer is required by Next.js 15)
- pnpm 9+ (`corepack enable` to activate the pnpm version bundled with Node)
- PostgreSQL 14+ running locally or remotely

## Local setup (Windows / PowerShell)

1. Open this folder in VS Code and open a PowerShell terminal.
2. If PostgreSQL is not installed, install PostgreSQL 14+ using the official Windows installer, leave the database service running, and note the password you set for the `postgres` user. Create a database named `destiny` from PowerShell:

   ```powershell
   psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE destiny;"
   ```

   If you use another PostgreSQL username, host, or port, substitute those values in the command and in `DATABASE_URL`.

3. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Edit `.env`. Set `DATABASE_URL` to your local connection, for example:

   ```dotenv
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/destiny?schema=public"
   ```

   Generate a private Auth.js secret and paste it into `AUTH_SECRET`:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Keep `.env` local and never commit it.

5. Install dependencies and generate the Prisma client:

   ```powershell
   pnpm install
   ```

6. Create the database schema and tables:

   ```powershell
   pnpm exec prisma migrate dev --name init
   ```

7. Load deterministic sample professionals, slots, medicines, and demo accounts. **The seed script deletes existing Destiny app data first**, so only run this against a fresh disposable development database:

   ```powershell
   pnpm db:seed
   ```

   If the demo data is already installed and you only need to ensure every existing professional lists Hindi and English, run the non-destructive language update instead:

   ```powershell
   pnpm db:languages
   ```

   To clear saved patient activity for all accounts while keeping accounts, professional profiles, medicines, and available slots, run:

   ```powershell
   pnpm db:clear-activity
   ```

8. Start Destiny:

   ```powershell
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Verify the setup

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

The build and server need a reachable PostgreSQL database because server-rendered app pages query Prisma.

## Demo accounts

All accounts use `Demo@1234`:

| Role | Email | Demo state |
| --- | --- | --- |
| Patient | `patient1@demo.destiny` | Completed demo session and a prescription |
| Patient | `patient2@demo.destiny` | Fresh assessment and booking journey |
| Psychiatrist | `psychiatrist@demo.destiny` | Can issue demo prescriptions |
| Counsellor | `counsellor@demo.destiny` | Pro console access; prescribing is disabled |

## 5-minute walkthrough

1. Register or sign in as `patient2@demo.destiny`.
2. Open **Assessment**, choose a topic, and complete the questions. Keyboard `1`–`4` selects an answer; progress saves in browser local storage.
3. Review the care report and open a suggested sample provider profile.
4. Select an upcoming slot and confirm a demo booking. The booking API atomically reserves a slot, and writes an HTML confirmation preview under `.mail-previews/`.
5. In **Appointments**, join when within 10 minutes before to 15 minutes after the slot start. Camera access is only used for the local preview; there is no remote connection or recording.
6. End the session to mark the demo appointment completed and unlock daily check-ins.
7. Sign in as `psychiatrist@demo.destiny`, open **Pro Console**, and issue a demo prescription for a completed session.
8. Sign in as `patient1@demo.destiny`, open **E-Pharmacy**, and see the prescription-gated item alongside general wellness catalog entries. Checkout and order progression are simulated.

## Implemented MVP behavior

- Four 25-item check-in flows; PHQ-9/GAD-7/PSS-10/AUDIT/DAST score bands and the PHQ-9 item-9 safety flag.
- Authenticated result reports, urgency messaging, and suggested sample professionals.
- Professional directory filters and profile availability.
- Transactional/conditional slot reservation to prevent double-booking.
- Owner-checked session room access and bounded join window.
- Daily habit check-ins unlocked by a completed session, with a 7-day progress visualization.
- Prescription medicines can only be ordered when present on the patient's latest psychiatrist-issued prescription.
- Prescription creation is restricted on the server to psychiatrists and completed sessions they conducted.

## Before any real-world use

This is a product demo, not a deployable clinical platform. Before processing real patient data or offering real care, the product needs clinical governance and validated assessment content, India-specific privacy/legal review, security and penetration testing, production-grade authorization/audit controls, data retention and deletion workflows, verified professional onboarding, crisis escalation design, real telehealth infrastructure, and regulated payment/pharmacy fulfillment. Never put real patient information into this MVP.
