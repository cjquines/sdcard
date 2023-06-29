import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { DB, Metadata, Sequence } from "./types";
import { parseFile } from "./parser";

const createStore = <T extends object>(
  name: string,
  initialState: T,
  options?: CreateStoreOptions<T>
) =>
  createStoreUnwrapped(name)(initialState, {
    devtools: { enabled: true },
    ...options,
  });

const dbStore = createStore<DB>(
  "db",
  {
    name: "sdcard",
    comment: "",
    sequences: {},
    // some defaults
    categories: {
      difficulty: {
        category: "difficulty",
        comment: "",
        options: ["easy", "medium", "hard"],
      },
    },
    tags: {
      ["@1"]: {
        tag: "@1",
        comment: "called during chamateur night, april 24",
      },
    },
  },
  {
    persist: { enabled: true, name: "db" },
  }
).extendActions((set, get) => ({
  /**
   * Add a bunch of sequences to current db, removing duplicate times.
   * Returns number of sequences added.
   */
  importSequences: async (file: File) => {
    const text = await file.text();
    const existingTimes = new Set(
      Object.values(get.sequences()).map((seq) => seq.date)
    );

    // TODO: we might eventually want to make this async
    const newSequences = parseFile(text).filter(
      (seq) => !existingTimes.has(seq.date)
    );

    set.state((state) => {
      for (const seq of newSequences) {
        state.sequences[seq.id] = seq;
      }
    });

    return newSequences.length;
  },
  /**
   * Edit a bunch of sequences. If add is true, then replace the metadata;
   * otherwise remove the metadata.
   */
  editSequences: (seqs: Sequence[], metadata: Partial<Metadata>, add: boolean) =>
    set.state((state) => {
      for (const seq of seqs) {
        const sequence = state.sequences[seq.id];

        // modify categories
        for (const [category, option] of Object.entries(metadata.categories ?? {})) {
          if (add) {
            sequence.categories[category] = option;
          } else {
            delete sequence.categories[category];
          }
        }

        // modify tags
        for (const tag of metadata.tags ?? []) {
          if (add && !sequence.tags.includes(tag)) {
            sequence.tags.push(tag);
          } else {
            const idx = sequence.tags.findIndex((tag_) => tag_ === tag);
            if (idx !== -1) {
              sequence.tags.splice(idx, 1);
            }
          }
        }
      }
    }),
}));

const rootStore = {
  db: dbStore,
};

export const useTracked = () => mapValuesKey("useTracked", rootStore);
export const actions = mapValuesKey("set", rootStore);
