import { createServer } from "node:http";
import { ZodError } from "zod";
import { InfraiError } from "./infrai_image_client.ts";
import { prepareOrderImage } from "./order_image.ts";

createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/orders/image") { res.writeHead(404).end(); return; }
  let body = ""; for await (const chunk of req) body += chunk;
  try { const result = await prepareOrderImage(JSON.parse(body)); res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result)); }
  catch (error) {
    const clientError = error instanceof SyntaxError || error instanceof ZodError || (error instanceof InfraiError && error.status >= 400 && error.status < 500);
    res.writeHead(clientError ? 400 : 500, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "request failed" }));
  }
}).listen(Number(process.env.PORT ?? 3000));
console.log("POST /orders/image on port " + (process.env.PORT ?? 3000));
