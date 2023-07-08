import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { StoreApi } from "zustand";
import { DB, Sequence, SequenceId, Session } from "./types";
import { parseFile } from "./parser";
import { createEnhancedJSONStorage } from "./storage";
import { Category, CategoryId, DEFAULT_METADATA, Tag, TagId } from "./metadata";
import { Query } from "./search";

const createStore = <T extends object>(
  name: string,
  initialState: T,
  options?: CreateStoreOptions<T>,
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
    sequences: new Map(),
    ...DEFAULT_METADATA,
  },
  {
    persist: {
      enabled: true,
      name: "sdcard-db",
      storage: createEnhancedJSONStorage(() => localStorage),
    },
  },
).extendActions((set, get) => ({
  /** Edit a sequence. */
  editSeq: (seqId: SequenceId, edit: (seq: Sequence) => void) => {
    set.state((state) => {
      const sequence = state.sequences.get(seqId);
      if (sequence) edit(sequence);
    });
  },
  /** Edit a category. */
  editCategory: (categoryId: CategoryId, edit: (cat: Category) => void) => {
    set.state((state) => {
      const category = state.categories.get(categoryId);
      if (category) edit(category);
    });
  },
  /** Edit a category. */
  editTag: (tagId: TagId, edit: (tag: Tag) => void) => {
    set.state((state) => {
      const tag = state.tags.get(tagId);
      if (tag) edit(tag);
    });
  },
  /**
   * Add a bunch of sequences to current db, removing duplicate times.
   * Returns number of sequences added.
   */
  importSequences: async (file: File) => {
    const text = await file.text();
    const existingTimes = new Set(
      Array.from(get.sequences().values()).map((seq) => seq.date),
    );

    // TODO: we might eventually want to make this async
    const newSequences = parseFile(text).filter(
      (seq) => !existingTimes.has(seq.date),
    );

    set.state((state) => {
      for (const seq of newSequences) {
        state.sequences.set(seq.id, seq);
      }
    });

    return newSequences.length;
  },
}));

const sessionStore = createStore<Session>("session", {
  autoTag: null,
  queries: [
    {
      name: "default",
      options: [],
    },
  ],
  stacks: [],
})
  .extendSelectors((state) => ({
    /** Is the session ongoing? */
    ongoing: () => state.stacks.length !== 0,
  }))
  .extendActions((set, get) => ({
    /** Start the session with everything that passes. */
    init: () =>
      set.state((state) => {
        // TODO: dedupe, randomize order
        const all = Array.from(dbStore.get.sequences().values());
        state.stacks = state.queries.map((query) =>
          all.filter((sequence) => Query.pass(query, sequence)),
        );
      }),
    /** Add this sequence back to the stack. */
    unpop: (idx: number, seq: Sequence) =>
      set.state((state) => {
        state.stacks[idx].push(seq);
      }),
    /** Pop the top sequence from the stack. */
    pop: (idx: number) => {
      const res = get.stacks()[idx].at(-1);
      set.state((state) => {
        state.stacks[idx].pop();
      });
      return res;
    },
    /** Stop the session. */
    stop: () => set.stacks([]),
  }));

const rootStore = {
  db: dbStore,
  session: sessionStore,
};

// oops bad type :(
const useStore = mapValuesKey("useStore", rootStore) as unknown as {
  [k in keyof typeof rootStore]: StoreApi<(typeof rootStore)[k]>;
};
export const subscribe = mapValuesKey("subscribe", useStore);
export const useTracked = () => mapValuesKey("useTracked", rootStore);
export const store = mapValuesKey("get", rootStore);
export const actions = mapValuesKey("set", rootStore);
