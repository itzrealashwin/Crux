const ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

export const generatePrefixedCode = (prefix, length = 6) => {
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * ALPHANUM.length);
    suffix += ALPHANUM[idx];
  }
  return `${prefix}${suffix}`.toUpperCase();
};

export const buildUserCode = (email = "") => {
  const base = email.split("@")[0] || "USER";
  const safe = base.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "USER";
  return `USER-${safe}-${generatePrefixedCode("", 4)}`;
};

export const assignUniqueCode = async (doc, field, createCandidate, maxAttempts = 20) => {
  if (doc[field]) return;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createCandidate();
    const exists = await doc.constructor.exists({ [field]: candidate });

    if (!exists) {
      doc[field] = candidate;
      return;
    }
  }

  throw new Error(`Could not generate unique ${field}`);
};
