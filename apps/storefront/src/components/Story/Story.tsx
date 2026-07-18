import type { AboutContentData } from "~/lib/cms";
import { AboutContent } from "./AboutContent";

export interface StoryProps {
  content: AboutContentData;
}

export function Story({ content }: StoryProps) {
  return (
    <section className={`section paper-bg`} id="story">
      <AboutContent content={content} />
    </section>
  );
}
