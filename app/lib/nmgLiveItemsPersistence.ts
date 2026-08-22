import { createHash } from "node:crypto";
import { BlobAccessError, BlobPreconditionFailedError } from "@vercel/blob";
import type { LiveItemsSnapshot } from "./nmgSmartMenu";

export class LiveItemsSnapshotConflictError extends Error {
  constructor() {
    super("NMG live items changed without a newer source timestamp.");
    this.name = "LiveItemsSnapshotConflictError";
  }
}

export class LiveItemsSnapshotBusyError extends Error {
  constructor() {
    super("NMG live item state was busy.");
    this.name = "LiveItemsSnapshotBusyError";
  }
}

interface StoredVersion {
  snapshot: LiveItemsSnapshot | null;
  etag: string | null;
}

export interface LiveItemsPersistenceOperations {
  readVersion: () => Promise<StoredVersion>;
  create: (snapshot: LiveItemsSnapshot) => Promise<void>;
  overwrite: (snapshot: LiveItemsSnapshot, etag: string) => Promise<void>;
  sleep?: (milliseconds: number) => Promise<void>;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize((value as Record<string, unknown>)[key])]));
}

export function liveItemsContentHash(snapshot: Pick<LiveItemsSnapshot, "items">) {
  return createHash("sha256").update(JSON.stringify(canonicalize(snapshot.items))).digest("hex");
}

export async function persistLiveItemsSnapshot(
  snapshot: LiveItemsSnapshot,
  operations: LiveItemsPersistenceOperations,
): Promise<"written" | "identical-noop" | "newer-noop"> {
  const incomingMs = Date.parse(snapshot.sourceTimestamp);
  if (!Number.isFinite(incomingMs)) throw new LiveItemsSnapshotConflictError();
  const incomingHash = liveItemsContentHash(snapshot);
  const sleep = operations.sleep || ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await operations.readVersion();
    if (current.snapshot) {
      const currentMs = Date.parse(current.snapshot.sourceTimestamp);
      if (!Number.isFinite(currentMs)) throw new LiveItemsSnapshotConflictError();
      if (currentMs > incomingMs) return "newer-noop";
      if (currentMs === incomingMs) {
        if (liveItemsContentHash(current.snapshot) === incomingHash) return "identical-noop";
        throw new LiveItemsSnapshotConflictError();
      }
    }

    try {
      if (!current.etag) {
        await operations.create(snapshot);
      } else {
        // The conditional write is the concurrency check. A second HEAD can
        // observe a different representation/version and create a false race;
        // if the blob changed, put(ifMatch) returns a precondition failure.
        await operations.overwrite(snapshot, current.etag);
      }
      return "written";
    } catch (error) {
      if (error instanceof BlobAccessError) throw error;
      if (error instanceof BlobPreconditionFailedError) {
        await sleep(25 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
  throw new LiveItemsSnapshotBusyError();
}
