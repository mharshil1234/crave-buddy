This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mood Room: Phase 0

Mood Room chat requires both the Next.js app and the Socket.IO process. Run these commands in separate terminals from this directory:

```bash
npm run dev
npm run socket
```

The socket process loads `.env` automatically and requires `DATABASE_URL`. The database must have the checked-in Prisma migrations applied, including `20260628194408_add_mood_room`.

`npm run socket` watches the socket server and its imports, restarting when source files change. After changing environment variables, restart it manually. If the browser reports `xhr poll error`, confirm the socket process is running and restart any instance launched before updating the socket code; credentialed polling requires the current server's CORS configuration.

Optional socket configuration:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Browser connection URL; set before building the app. |
| `SOCKET_PORT` | `PORT`, or `3001` | Socket server listening port. |
| `SOCKET_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated app origins allowed to send credentials. |

Use the same hostname for the app and socket server so the Better Auth session cookie is available to both. Configure HTTPS and cookie settings for your deployment when using separate domains.

Chat connections authenticate with Better Auth cookies. Joining and reading history require an active room membership and a session belonging to that room. Messages are limited to 5,000 characters and are acknowledged and broadcast only after PostgreSQL saves them. Completed sessions allow reading history but reject new messages.

`GET /api/mood-room/:roomId/session/:sessionId/messages` returns the latest 50 persisted messages in chronological order. History and live messages share database IDs, and the client merges them during initial loading and reconnection. Presence counts unique members across tabs; leaving or navigating away removes the connection from the session.

All planned lifecycle events are declared in `src/socket/types.ts`. Phase 0 implements joining, leaving, presence, and chat. Craving collection, phase transitions, voting, and finalization handlers belong to the later phases.

### Verify Phase 0

1. Run `npm run build`.
2. Start both processes and sign in as two room members using separate browser profiles or an incognito window.
3. Open the same session and confirm both members appear as active. A second tab for the same member should not increase the count.
4. Send messages from both members and refresh. The messages and sender identities should remain correct.
5. Briefly disconnect and reconnect the socket process. Chat should rejoin and reload history automatically.
6. Navigate away from the session and confirm the remaining member's active count decreases. An unauthenticated or nonmember request to the history endpoint must be rejected.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
