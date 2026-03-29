function parseCookieHeader(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, chunk) => {
      const separatorIndex = chunk.indexOf("=");
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = chunk.slice(0, separatorIndex).trim();
      const value = chunk.slice(separatorIndex + 1).trim();

      if (!key) {
        return accumulator;
      }

      try {
        accumulator[key] = decodeURIComponent(value);
      } catch {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
}

module.exports = {
  parseCookieHeader,
};
