import crypto from 'crypto';

export const hashValue = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

export const compareHash = (value, hash) => {
  const hashedValue = hashValue(value);
  return hashedValue === hash;
};
