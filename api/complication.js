// POST /api/complication  { id: 1-6, passcode: "..." }
// Returns the complication for that card only if the passcode is correct.
const crypto = require("crypto");
const complications = require("../lib/complications");

// SHA-256 of the passcode, so the passcode itself never appears in the code.
const PASSCODE_HASH = "b9a45e1dad2c24bf087858e3ca6e54d2b3a6400de6757bc03fd27eed9304b1d9";

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { error: "Bad request" });
  }

  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  const expected = Buffer.from(PASSCODE_HASH, "hex");
  const given = Buffer.from(sha256(passcode), "hex");
  if (!crypto.timingSafeEqual(expected, given)) {
    return send(res, 401, { error: "Incorrect passcode" });
  }

  const item = complications[String(body.id)];
  if (!item) return send(res, 404, { error: "Not found" });
  return send(res, 200, item);
};
