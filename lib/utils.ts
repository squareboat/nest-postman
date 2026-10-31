import * as crypto from "crypto"

/**
 * Name-based UUID (RFC 4122 version 5, SHA-1): the same name and namespace always give the
 * same id, so the collection does not change between starts.
 */
export function uuidV5(name: string, namespace: string): string {
  const hash = crypto
    .createHash("sha1")
    .update(Buffer.from(namespace.replace(/-/g, ""), "hex"))
    .update(name, "utf8")
    .digest()
  hash[6] = (hash[6] & 0x0f) | 0x50
  hash[8] = (hash[8] & 0x3f) | 0x80
  const hex = hash.subarray(0, 16).toString("hex")
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-")
}

/**
 * Join a base URL and path segments with single slashes:
 * joinUrl("http://localhost:3000/", "/v1", "users/", "/") -> "http://localhost:3000/v1/users"
 */
export function joinUrl(base: string, ...segments: (string | undefined)[]): string {
  const root = (base || "").replace(/\/+$/, "")
  const path = segments
    .map((s) => (s || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/")
  if (!path) return root || "/"
  return root ? `${root}/${path}` : `/${path}`
}

/**
 * Folder name for a controller class: "UserProfileController" -> "User profile".
 * The name is split into words (camelCase humps, acronyms, digits, and runs of letters without
 * case such as CJK), lowercased, the first letter upper-cased and a " controller" word dropped.
 * Accents are removed from Latin letters ("ÉtéController" -> "Ete").
 * For most ASCII names this matches lodash `upperFirst(lowerCase(name)).replace(" controller", "")`,
 * which 0.1.0 used, but not always: digits are always split off ("My2ndController" -> "My 2 nd",
 * lodash "My 2nd") and "ß" is kept ("StraßeController" -> "Straße", lodash "Strasse").
 * If no words are left, the class name is used as is.
 */
export function groupName(className: string): string {
  const words =
    className
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC")
      .match(/\p{Lu}+(?=\p{Lu}\p{Ll})|[\p{Lu}\p{Lt}]?\p{Ll}+|\p{Lu}+|[\p{Lo}\p{Lm}]+|\p{N}+/gu) || []
  const name = words.join(" ").toLowerCase()
  return (name.charAt(0).toUpperCase() + name.slice(1)).replace(" controller", "") || className
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}
