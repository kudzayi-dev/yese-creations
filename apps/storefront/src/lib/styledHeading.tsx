import type { ReactNode } from "react";

/**
 * A tiny, deliberately limited markup for headings that need one or two
 * inline "accent" words without giving editors full rich text / raw HTML
 * (which would risk breaking the layout or injecting arbitrary markup).
 *
 * Two tokens, matched literally:
 *   *word*  -> wrapped in `classNames.script`  (the coral script-accent style)
 *   _word_  -> wrapped in `classNames.stroke`  (the outlined-stroke style)
 * A literal newline in the source text becomes a <br />.
 *
 * Used by Hero's headline (both tokens) and the About/Story headline
 * (script token only) so editors can keep the brand's inline-styled-word
 * treatment without a code change, while the actual styling/CSS classes
 * stay owned by each component.
 */
export function renderStyledHeading(
  text: string,
  classNames: { script?: string; stroke?: string },
): ReactNode[] {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const parts = line.split(/(\*[^*]+\*|_[^_]+_)/g).filter((part) => part !== "");
    parts.forEach((part, partIndex) => {
      const key = `${lineIndex}-${partIndex}`;
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        nodes.push(
          <span className={classNames.script} key={key}>
            {part.slice(1, -1)}
          </span>,
        );
      } else if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        nodes.push(
          <span className={classNames.stroke} key={key}>
            {part.slice(1, -1)}
          </span>,
        );
      } else {
        nodes.push(part);
      }
    });
    if (lineIndex < lines.length - 1) {
      nodes.push(<br key={`br-${lineIndex}`} />);
    }
  });

  return nodes;
}
