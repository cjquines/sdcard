import { Metadata, Sequence } from "./types";

export function getCommonMetadata(sequences: Sequence[]): Metadata {
  const metadata: Metadata = { categories: {}, tags: [] };

  if (sequences.length === 0) {
    return metadata;
  }

  const [head, ...tail] = sequences;
  metadata.categories = head.categories;
  metadata.tags = head.tags;

  for (const seq of tail) {
    metadata.categories = Object.fromEntries(
      Object.entries(metadata.categories).filter(
        ([category, option]) => seq.categories[category] === option
      )
    );
    metadata.tags = metadata.tags.filter((tag) => seq.tags.includes(tag));
  }

  return metadata;
}
