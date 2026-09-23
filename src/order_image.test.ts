import test from "node:test";
import assert from "node:assert/strict";
import { orderImageRequest } from "./order_image.ts";

test("an order image requires an id and chooses webp by default", () => {
  const parsed = orderImageRequest.parse({ orderId: "ORD-42", image: "data:image/jpeg;base64,abc" });
  assert.equal(parsed.format, "webp");
  assert.throws(() => orderImageRequest.parse({ image: "x" }));
});
