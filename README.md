# TrickBag + Bagtunes

One bag scan. Two apps. Shared store code.

Bag sign art (puzzle + guitar / notes) is in `public/art/`:

- `bag-sign.jpg` — poster for the bag face
- `bag-sticker.jpg` — window / sticker layout
- `bag-sign.svg` — vector for print

Print the sticker next to a real store QR that points at `/s/STOREID`.

- `trickbag.app` path: `/trickbag/` — weekly puzzle, treat code
- `bagtunes.app` path: `/bagtunes/` — neighborhood songs unlocked by the same visit
- Store QR: `/s/ROSE` `/s/711-J` `/s/OAK`
- Cashier: `/cashier/?store=ROSE`

## Run

```bash
node server.js
```

Open http://localhost:3847

## How they connect

1. Bag QR hits `/s/STOREID`
2. TrickBag posts `/api/unlock` after a correct puzzle
3. Server returns a 6-letter treat code + a `bt_` token
4. Browser opens `/bagtunes/?store=ROSE&unlock=bt_ROSE_…`
5. Cashier posts `/api/redeem` with the 6-letter code at that store only
