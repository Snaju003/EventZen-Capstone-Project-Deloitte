function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

module.exports = {
  hasText,
  normalizeText,
};
