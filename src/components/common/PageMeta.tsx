import { useEffect } from 'react'

export interface PageMetaProps {
  /** Full page title. Will be appended with " — CrowdSignal" */
  title: string
  /** Optional meta description for SEO */
  description?: string
}

const APP_NAME = 'CrowdSignal'

/**
 * Imperatively updates document.title and the meta description tag
 * on every page render. Drop this at the top of any page component.
 *
 * @example
 * <PageMeta title="Dashboard" description="Market overview and latest signals." />
 * // → document.title = "Dashboard — CrowdSignal"
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} — ${APP_NAME}`

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      const prevContent = tag.content
      tag.content = description
      return () => {
        document.title = previous
        if (tag) tag.content = prevContent
      }
    }

    return () => { document.title = previous }
  }, [title, description])

  return null
}
