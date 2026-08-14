import "dotenv/config";
import type { Request, Response } from "express";
import app from "../src/app.js";
import { configureDNS } from "../src/config/dns.js";
import { connectDB } from "../src/config/db.js";
import { configureCloudinary } from "../src/config/cloudinary.js";
import { runSeeds } from "../src/seeds/index.js";

/**
 * Vercel serverless entry point for the Express API.
 *
 * Vercel reuses warm instances between invocations, so the one-time setup
 * (MongoDB connection, Cloudinary config, idempotent seeds) is cached in a
 * module-level promise and only runs once per warm instance. This also
 * guarantees the DB is connected before any request is handled.
 *
 * NOTE: `app.listen()` must NOT be called here — Vercel invokes this
 * handler directly instead of opening a port.
 */
let readyPromise: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      // DNS override is a no-op unless DNS_SERVERS is set — leave unset on Vercel.
      configureDNS();
      await connectDB();
      configureCloudinary();
      await runSeeds();
    })();
  }
  return readyPromise;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  await ensureReady();
  app(req, res);
}
