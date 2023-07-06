import { Brand, make as makeBrander } from "ts-brand";
import { Sequence } from "./types";

/**
 * A category is a collection of exclusive options, e.g. difficulty, with
 * options like easy, medium, hard.
 */
export type Category = {
  readonly id: Brand<string, "CategoryId">;
  name: string;
  comment: string;
  options: Brand<string, "CategoryOption">[];
};

export type CategoryId = Category["id"];
export type CategoryOption = Category["options"][number];
export const CategoryId = makeBrander<CategoryId>();
export const CategoryOption = makeBrander<CategoryOption>();

/**
 * A tag is anything that can be assigned to a sequence, e.g. a tag for every
 * sequence called at a certain dance.
 */
export type Tag = {
  readonly id: Brand<string, "TagId">;
  name: string;
  comment: string;
};

export type TagId = Tag["id"];
export const TagId = makeBrander<TagId>();

/** Metadata carries categories (e.g. difficulty) and tags (e.g. "weird"). */
export type Metadata = {
  categories: Map<CategoryId, CategoryOption>;
  tags: Set<TagId>;
};

// some default categories/tags:

const DIFFICULTY: Category = {
  id: CategoryId("Difficulty"),
  name: "Difficulty",
  comment: "",
  options: ["Easy", "Medium", "Hard"].map(CategoryOption),
};

const DANCE_ONE: Tag = {
  id: TagId("@1"),
  name: "@1",
  comment: "Called during Chamateur Night, April 24",
};

const WEIRD: Tag = {
  id: TagId("Weird"),
  name: "Weird",
  comment: "",
};

export const DEFAULT_METADATA = {
  categories: new Map([[DIFFICULTY.id, DIFFICULTY]]),
  tags: new Map([
    [DANCE_ONE.id, DANCE_ONE],
    [WEIRD.id, WEIRD],
  ]),
};

// metadata functions:

/**
 * Mutates data, either adding everything from {categories, tags} or removing
 * them, based on add.
 */
function edit(
  data: Metadata,
  { categories = new Map(), tags = new Set() }: Partial<Metadata>,
  add: boolean,
): void {
  // modify categories
  for (const [category, option] of categories?.entries() ?? []) {
    if (add) {
      data.categories.set(category, option);
    } else {
      data.categories.delete(category);
    }
  }

  // modify tags
  for (const tag of tags?.values() ?? []) {
    if (add) {
      data.tags.add(tag);
    } else {
      data.tags.delete(tag);
    }
  }
}

// these specialize editMetadata:

function addOption(
  data: Metadata,
  category: CategoryId,
  option: CategoryOption,
) {
  edit(data, { categories: new Map([[category, option]]) }, true);
}

function removeOption(data: Metadata, category: CategoryId) {
  edit(data, { categories: new Map([[category, CategoryOption("")]]) }, false);
}

function addTag(data: Metadata, tag: TagId) {
  edit(data, { tags: new Set([tag]) }, true);
}

function removeTag(data: Metadata, tag: TagId) {
  edit(data, { tags: new Set([tag]) }, false);
}

function empty(): Metadata {
  return { categories: new Map(), tags: new Set() };
}

function intersect(sequences: Sequence[]): Metadata {
  const metadata = empty();

  if (sequences.length === 0) {
    return metadata;
  }

  const [head, ...tail] = sequences;
  metadata.categories = new Map(head.categories);
  metadata.tags = new Set(head.tags);

  for (const seq of tail) {
    const categoriesToRemove = [];
    const tagsToRemove = [];
    for (const [category, option] of metadata.categories) {
      if (seq.categories.get(category) !== option) {
        categoriesToRemove.push(category);
      }
    }
    for (const tag of metadata.tags) {
      if (!seq.tags.has(tag)) {
        tagsToRemove.push(tag);
      }
    }
    categoriesToRemove.forEach((category) =>
      metadata.categories.delete(category),
    );
    tagsToRemove.forEach((tag) => metadata.tags.delete(tag));
  }

  return metadata;
}

export const Metadata = {
  edit,
  addOption,
  removeOption,
  addTag,
  removeTag,
  empty,
  intersect,
};
