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
 * Same output as lodash `upperFirst(lowerCase(name)).replace(" controller", "")`, which 0.1.0 used.
 */
export function groupName(className: string): string {
  const words =
    className
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .match(/\p{Lu}+(?=\p{Lu}\p{Ll})|\p{Lu}?\p{Ll}+|\p{Lu}+|\p{N}+/gu) || []
  const name = words.join(" ").toLowerCase()
  return (name.charAt(0).toUpperCase() + name.slice(1)).replace(" controller", "")
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}
