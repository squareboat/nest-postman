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
