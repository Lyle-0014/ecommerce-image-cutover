import { z } from "zod";
import { compressImage } from "./infrai_image_client.ts";

export const orderImageRequest = z.object({ orderId: z.string().min(1), image: z.string().min(1), format: z.enum(["webp", "jpeg", "png"]).default("webp") });
export type OrderImageRequest = z.infer<typeof orderImageRequest>;
export async function prepareOrderImage(input: unknown) {
  const request = orderImageRequest.parse(input);
  const compressed = await compressImage(request.image, request.format);
  return { orderId: request.orderId, fulfillment: "ready", receiptImage: compressed, customerUpdate: `Order ${request.orderId} image optimized` };
}
