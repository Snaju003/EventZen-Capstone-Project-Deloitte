function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeSeatCount(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    return null;
  }

  return parsed;
}

module.exports = {
  readText,
  sanitizeSeatCount,
};
