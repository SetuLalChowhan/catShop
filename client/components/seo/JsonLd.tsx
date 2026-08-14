/**
 * Server component that renders a JSON-LD structured-data script tag.
 * Pass any serializable object via the `data` prop.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
