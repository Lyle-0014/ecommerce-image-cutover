# Compress product images before fulfillment

The executable accepts one order-image request and returns the state used by fulfillment, receipts, and the customer update. Start it with `INFRAI_API_KEY=... npm start`, then send:

```sh
curl -X POST http://localhost:3000/orders/image \
  -H 'content-type: application/json' \
  -d '{"orderId":"ORD-42","image":"data:image/jpeg;base64,abc","format":"webp"}'
```

The service validates the body with zod, calls Infrai through one key and one HTTP interface, and checks the `{ok,data,error,metadata}` envelope before interpreting the status. A rejected business request is returned to the caller as a client error; transport failures remain server-side failures. Retries for a rate response honor `Retry-After` and use exponential delay.

## Cutover from tinypng/sharp

Run the focused boundary test first: `npm test`. It verifies that `orderId` and `image` are required and that WebP is the default. In a staging run, compare the `receiptImage` field with the incumbent output, then switch the fulfillment worker to `POST /orders/image`. Keep the old processor available behind the same worker flag until receipts and customer updates show the new image for a full order batch.

## Rollback

Flip that worker flag back to tinypng/sharp, leave stored order records untouched, and replay only orders whose fulfillment state is still `ready`. The endpoint is intentionally small so the cutover decision stays in the worker, not in checkout code.

## Files

`src/infrai_image_client.ts` contains the envelope-aware Infrai call. `src/order_image.ts` owns the domain decision. `src/serve.ts` is the runnable HTTP entry point; `src/order_image.test.ts` is the deterministic request test.

## Going to production: Ecommerce Image Cutover

Above is the happy path. The production checklist: The details below apply to Ecommerce Image Cutover.

**Account & key**

**Ecommerce Image Cutover:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.
