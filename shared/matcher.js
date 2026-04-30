/**
 * Environment matching logic — single source of truth for URL/hostname matching.
 */

/**
 * Convert a simple glob pattern to a RegExp.
 * Supports: * (any chars), ? (single char)
 * Dots are escaped for hostname matching.
 */
function globToRegex(pattern) {
  const escaped = pattern
    .replace(/([.+^${}()|[\]\\])/g, "\\$1")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$", "i");
}

/**
 * Match a URL against a list of rules.
 * Returns the first matching rule, or null.
 * Rules are evaluated in array order (first match wins).
 */
function matchUrl(url, rules) {
  if (!url || !Array.isArray(rules)) return null;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const target = rule.type === "url" ? url : parsed.hostname;
    const regex = globToRegex(rule.pattern);

    if (regex.test(target)) {
      return rule;
    }
  }

  return null;
}

export { globToRegex, matchUrl };
