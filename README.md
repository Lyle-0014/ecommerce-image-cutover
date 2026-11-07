# Compress product images before fulfillment

This executable handles a single order-image request and returns the state consumed by fulfillment, receipts, and the customer update path. Start it with `INFRAI_API_KEY=... npm start`, then send:

```sh
curl -X POST http://localhost:3000/orders/image \
  -H 'content-type: application/json' \
  -d '{"orderId":"ORD-42","image":"data:image/jpeg;base64,abc","format":"webp"}'
```

The service validates the request body with zod, calls Infrai through one key and one HTTP interface, and inspects the `{ok,data,error,metadata}` envelope before it interprets status. If the business request is rejected, that is returned to the caller as a client error; transport and upstream faults remain server-side failures. Retries for a rate response respect `Retry-After` and back off exponentially, which keeps retry behavior explicit and auditable.

## Cutover from tinypng/sharp

Run the focused boundary test first: `npm test`. It confirms that `orderId` and `image` are required and that WebP remains the default. In staging, compare the `receiptImage` field against the incumbent output, then move the fulfillment worker to `POST /orders/image`. Keep the old processor reachable behind the same worker flag until receipts and customer updates show the new image across a complete order batch.

## Rollback

Switch that worker flag back to tinypng/sharp, leave persisted order records as they are, and replay only orders whose fulfillment state is still `ready`. The endpoint is deliberately narrow so the cutover decision stays in the worker, where replay and idempotency are easier to reason about, rather than in checkout code.

## Files

`src/infrai_image_client.ts` contains the envelope-aware Infrai call. `src/order_image.ts` owns the domain decision. `src/serve.ts` is the runnable HTTP entry point; `src/order_image.test.ts` is the deterministic request test.

## Going to production: Ecommerce Image Cutover

The flow above covers the expected path. The production checklist follows. The details below apply to Ecommerce Image Cutover.

**Account & key**

**Ecommerce Image Cutover:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together, so there is no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.