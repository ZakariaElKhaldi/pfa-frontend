export interface PostTextInput {
  title?: string | null
  display_content?: string | null
  cleaned_text?: string | null
  content?: string | null
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function isNearDuplicate(a: string, b: string): boolean {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.startsWith(nb) || nb.startsWith(na)) return true
  return false
}

export function getPostBodyText(post: PostTextInput): string {
  return post.display_content ?? post.cleaned_text ?? post.content ?? ''
}

export function composePostText(post: PostTextInput): string {
  const title = (post.title ?? '').trim()
  const body = getPostBodyText(post).trim()

  if (!title) return body
  if (!body) return title
  if (isNearDuplicate(title, body)) return title

  return `${title}\n\n${body}`
}
