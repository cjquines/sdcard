import { Brand, make as makeBrander } from "ts-brand";
import { Sequence } from "./types";

/**
 * A category is a collection of exclusive options, e.g. difficulty, with
 * options like easy, medium, hard.
 */
export type Category = {
  category: Brand<string, "CategoryId">;
  comment: string;
  options: Brand<string, "CategoryOption">[];
};

export type CategoryId = Category["category"];
export type CategoryOption = Category["options"][number];
export const CategoryId = makeBrander<CategoryId>();
export const CategoryOption = makeBrander<CategoryOption>();

/**
 * A tag is anything that can be assigned to a sequence, e.g. a tag for every
 * sequence called at a certain dance.
 */
export type Tag = {
  tag: Brand<string, "TagId">;
  comment: string;
};

export type TagId = Tag["tag"];
export const TagId = makeBrander<TagId>();

/** Metadata carries categories (e.g. difficulty) and tags (e.g. "weird"). */
export type Metadata = {
  categories: Map<CategoryId, CategoryOption>;
  tags: Set<TagId>;
};

// some default categories/tags:

const DIFFICULTY: Category = {
  category: CategoryId("difficulty"),
  comment: "",
  options: ["easy", "medium", "hard"].map(CategoryOption),
};

const DANCE_ONE: Tag = {
  tag: TagId("@1"),
  comment: "called during chamateur night, april 24",
};

const WEIRD: Tag = {
  tag: TagId("weird"),
  comment: "",
};

export const DEFAULT_METADATA = {
  categories: new Map([[DIFFICULTY.category, DIFFICULTY]]),
  tags: new Map([
    [DANCE_ONE.tag, DANCE_ONE],
    [WEIRD.tag, WEIRD],
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
  add: boolean
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
  option: CategoryOption
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

function intersect(sequences: Sequence[]): Metadata {
  const metadata: Metadata = { categories: new Map(), tags: new Set() };

  if (sequences.length === 0) {
    return metadata;
  }

  const [head, ...tail] = sequences;
  metadata.categories = head.categories;
  metadata.tags = head.tags;

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
    categoriesToRemove.forEach(category => seq.categories.delete(category));
    tagsToRemove.forEach(tag => seq.tags.delete(tag));
  }

  return metadata;
}

export const Metadata = {
  edit,
  addOption,
  removeOption,
  addTag,
  removeTag,
  intersect,
};
