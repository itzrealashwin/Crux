export const toPlain = (doc) => {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map((item) => toPlain(item));
  if (typeof doc.toObject === "function") return doc.toObject();
  return doc;
};

const isRawObjectIdValue = (val) => {
  if (!val) return false;
  if (typeof val === "string") {
    return /^[a-fA-F0-9]{24}$/.test(val);
  }
  if (typeof val === "object" && val._bsontype === "ObjectId") {
    return true;
  }
  return false;
};

export const stripInternalFields = (value) => {
  if (Array.isArray(value)) return value.map(stripInternalFields);

  // ✅ Fix: return Date as-is
  if (value instanceof Date) return value;

  if (!value || typeof value !== "object") return value;

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (
      key === "_id" ||
      key === "id" ||
      key === "_v" ||
      key === "__v"
    ) {
      continue;
    }

    if (key.endsWith("Id") && isRawObjectIdValue(val)) continue;

    out[key] = stripInternalFields(val);
  }

  return out;
};

export const sanitizeForResponse = (doc) => stripInternalFields(toPlain(doc));
