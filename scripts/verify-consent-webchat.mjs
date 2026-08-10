import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const chat = await readFile(new URL("../app/delivery/NativeMedicineWebChat.tsx", import.meta.url), "utf8");
const delivery = await readFile(new URL("../app/delivery/DeliveryContent.tsx", import.meta.url), "utf8");

for (const expected of [
  'storeId: "NM"',
  'sod-web-chat:NM',
  'smsConsent',
  'required type="checkbox"',
  'Reply YES to confirm',
  '/api/web-chat/session',
  '/api/web-chat/messages',
  '/api/web-chat/id-review',
  'NEW_CUSTOMER',
  'RETURNING_CUSTOMER',
  '/api/web-chat/phone',
  'phoneConfirmation: replacementPhoneConfirmation',
  'phoneVersion: conversation.phoneVersion',
  'START ANOTHER ORDER',
  '/api/web-chat/order-cycle',
  'requestId: crypto.randomUUID()',
  'securely retained for future identity and address verification',
]) assert.ok(chat.includes(expected), `Missing Web Chat contract: ${expected}`);

assert.ok(delivery.includes("<NativeMedicineWebChat />"), "Delivery page must render Native Medicine Garden Web Chat");
assert.ok(!chat.includes('storeId: "PC"') && !chat.includes("sod-web-chat:PC"), "Reference store identity must not remain");
console.log("Native Medicine Garden consent Web Chat contract passed.");
