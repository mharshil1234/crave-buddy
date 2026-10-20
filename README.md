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
| `SOCKET_SERVER_URL` | `NEXT_PUBLIC_SOCKET_URL`, or `http://localhost:3001` | Socket URL reachable from the Next.js server for craving API submissions. |

Use the same hostname for the app and socket server so the Better Auth session cookie is available to both. Configure HTTPS and cookie settings for your deployment when using separate domains.

Chat connections authenticate with Better Auth cookies. Joining and reading history require an active room membership and a session belonging to that room. Messages are limited to 5,000 characters and are acknowledged and broadcast only after PostgreSQL saves them. Completed sessions allow reading history but reject new messages.

`GET /api/mood-room/:roomId/session/:sessionId/messages` returns the latest 50 persisted messages in chronological order. History and live messages share database IDs, and the client merges them during initial loading and reconnection. Presence counts unique members across tabs; leaving or navigating away removes the connection from the session.

All planned lifecycle events are declared in `src/socket/types.ts`. Phase 0 implements joining, leaving, presence, and chat. Craving collection, phase transitions, voting, and finalization handlers belong to the later phases.

## Mood Room: Phase 1

The session opens in a lobby with live member presence and a host-only **Start Cravings Round** button. Starting persists `PROMPT_COLLECTION` in PostgreSQL and switches every connected member to the craving form. Chat stays available in a sticky, collapsible panel and shares the session's socket connection.

Each member can submit or edit one craving of up to 1,000 characters, including dietary needs or budget. Quick mood chips provide starting points. The group sees each saved craving and a live submission checklist. Reloading or reconnecting restores the persisted phase and submissions.

Only the host can select **Find Restaurants**. At least one craving is required. If members are still missing, the host must explicitly choose to continue with the submitted cravings. Proceeding persists `RESTAURANT_VOTING` and locks craving edits.

The authenticated prompt endpoint supports:

- `GET /api/mood-room/:roomId/session/:sessionId/prompt`: current prompts, submission count, and session state.
- `POST /api/mood-room/:roomId/session/:sessionId/prompt` with `{ "prompt": "Spicy vegetarian food" }`: submit or update the signed-in member's craving and broadcast it to the group. The socket service must be running. The request forwards the existing session cookie; it never accepts a client-supplied member identity.

Phase transitions and prompt writes lock the session row before checking its current phase. State snapshots carry an increasing `updatedAt` value so delayed responses cannot roll clients back to an older phase or submission list.

### Verify Phase 1

1. Start both processes and open the same session as host and guest in separate browser profiles.
2. Confirm online indicators update, only the host sees **Start Cravings Round**, and chat works beside the lobby.
3. Start the round. Both screens should immediately show the craving form.
4. Submit a craving in each profile. Check both counters, submitted text, and the saved state after refreshing.
5. Edit a craving and confirm the existing entry updates without increasing the count.
6. With a member still missing, confirm the host must explicitly opt to continue. With no submissions, proceeding must remain blocked.
7. Choose **Find Restaurants**. Both screens should show the saved cravings for the next round, and further craving edits must be rejected.

## Mood Room: Phase 2

After the host starts restaurant voting, the socket server sends the group's saved cravings and open restaurant catalogue to Gemini 2.5 Flash. The AI returns three or four catalogue IDs and a short reason for each; the app validates the IDs and uses catalogue metadata for the displayed restaurant details. Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env` for nomination generation. The AI request has a 55-second timeout. A failed generation is saved and can be retried by the host; a generation that remains in progress for over one minute can also be retried.

Members can vote for one nominee and change their vote while voting remains open. The host closes voting after everyone votes or explicitly opts to continue with partial votes. A unique highest vote count wins automatically. If the count is tied, the host chooses one of the tied nominees. The winner is persisted and all connected clients move to `ITEM_VOTING`; dish selection is the next phase.

`GET /api/mood-room/:roomId/session/:sessionId/vote/restaurant` returns the saved nominees, current vote tally, and session state. `POST` with `{ "restaurantId": "..." }` casts or changes the signed-in member's vote. Requests require an authenticated room member and the socket service must be running. Votes are limited to one per active member and nominee; session row locks serialize transitions and votes.

### Verify Phase 2

1. Start both processes and open one session as host and guest in separate browser profiles. Submit cravings from both members.
2. Have the host select **Find Restaurants**. Both screens should show the generation state, followed by the same three or four tailored nominees.
3. Vote from each profile and confirm the bars, counts, and voter initials update on both screens. Change one vote and confirm the tally moves.
4. Try closing before all members vote. Confirm the host must explicitly continue with partial votes; guests cannot close the round.
5. Test a tie and confirm only a tied nominee can be selected as winner. Refresh and confirm the winner and finished vote tally remain visible.
6. Temporarily remove the AI key or force a generation error in development. Confirm the failure is shown and the host can retry after correcting the cause.

## Mood Room: Phase 3

After the restaurant vote closes, members see the winning restaurant’s menu grouped by category. Use the plus and minus controls to set your own quantity for each dish. The shared tray totals all members’ quantities and shows the estimated subtotal and how many members chose each dish. Setting your quantity to zero removes your vote for that dish. Quantities are capped at 20 per member and item.

Only the host can select **Lock in order**. This saves the lock time and prevents further quantity changes while leaving the session in `ITEM_VOTING` for Phase 4 finalization. The item vote endpoint supports `GET` for the restaurant menu and group tray, `POST` with `{ "itemId": "...", "quantity": 2 }` to set the signed-in member’s quantity, and `PATCH` to lock the order as host. Requests require an authenticated room member and the socket service must be running for writes.

Restaurant matching uses the restaurant catalogue entries that currently have menus in `data/restaurantMenu.json`, so every nominee has a menu at the item selection step.

### Verify Phase 3

1. Open the session as host and guest. Close restaurant voting and confirm both screens show the winning restaurant’s menu.
2. Add dishes and change quantities from both profiles. Confirm each screen’s shared tray, member counts, and subtotal update immediately.
3. Set a member’s quantity to zero and confirm the group total decreases; confirm quantities above 20 are rejected.
4. Try locking an empty tray and confirm it is blocked. Add a dish and lock as host; confirm controls become read-only for both members.
5. Refresh and confirm the saved menu votes and locked state are restored.

## Mood Room: Phase 4

After the host locks the group tray, **Finalize group order** saves a read-only result containing the selected restaurant, agreed item quantities, and estimated total. Every connected member sees the same receipt, and reopening a completed session restores it from PostgreSQL. Ended sessions appear in the room’s **Past Sessions** list with the chosen restaurant.

The host can end any active session early from its session page. After confirmation, all members are returned to a read-only ended view, existing chat and votes remain saved, and no order is finalized. The room lobby lists ended-early sessions separately from completed orders.

`POST /api/mood-room/:roomId/session/:sessionId/finalize` finalizes the locked order for the host. `POST /api/mood-room/:roomId/session/:sessionId/cart` adds the saved order quantities to the signed-in member’s cart; it validates the membership and reads item IDs and quantities from the persisted result. Existing cart quantities are incremented. The cart action reports success and navigates to `/cart`.

### Verify Phase 4

1. Finish a session through item voting, lock the tray as host, and select **Finalize group order**.
2. Confirm host and guests immediately see the same receipt and that refreshing restores the finished session.
3. Confirm the session appears in the room’s **Past Sessions** list with the restaurant name; open it and confirm the receipt is read-only.
4. Add the order to cart from two member accounts. Each cart should contain the finalized items and quantities, added to any existing quantities.
5. Confirm guests cannot finalize and nonmembers cannot view the saved result or transfer it into a cart.

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
