import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { StoreApi } from "zustand";
import { DB, Sequence, SequenceId, Session, Stack, StackId } from "./types";
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

// typescript black magic, please ignore

type KeyOfType<T, V> = keyof {
  [K in keyof T as T[K] extends V ? K : never]: K;
};

type HasKeyOfType<T, V> = { [key in KeyOfType<T, V>]: V };

const mapEditor =
  <T, I, V>(
    set: { state: (fn: (draft: HasKeyOfType<T, Map<I, V>>) => void) => void },
    key: KeyOfType<T, Map<I, V>>,
  ) =>
  (id: I, edit: (value: V) => void) => {
    set.state((state) => {
      const value = state[key].get(id);
      if (value) edit(value);
    });
  };

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
  editSeq: mapEditor<DB, SequenceId, Sequence>(set, "sequences"),
  /** Edit a category. */
  editCategory: mapEditor<DB, CategoryId, Category>(set, "categories"),
  /** Edit a tag. */
  editTag: mapEditor<DB, TagId, Tag>(set, "tags"),
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
  ongoing: false,
  query: [],
  stacks: new Map(),
  stackOrder: [],
})
  .extendSelectors((state) => ({
    /** Get the current stack. */
    current: () => {
      const { stackOrder, stacks } = state;
      const topId = stackOrder[0];
      if (!topId) return;
      return stacks.get(topId);
    },
    /** Get the bottom of the specified stack (index - 1). */
    bottomOf: (id: StackId) => {
      const stack = state.stacks.get(id);
      if (!stack) return;
      const { sequences, index } = stack;
      return sequences[index - 1];
    },
    /** Get top of specified stack. */
    topOf: (id: StackId) => {
      const stack = state.stacks.get(id);
      if (!stack) return;
      const { sequences, index } = stack;
      return sequences[index];
    },
  }))
  .extendSelectors((_, get) => ({
    /** Get bottom of current stack. */
    bottomOfCurrent: () => {
      const stack = get.current();
      if (!stack) return;
      return get.bottomOf(stack.id);
    },
  }))
  .extendActions((set) => ({
    /** Edit a stack. */
    editStack: mapEditor<Session, StackId, Stack>(set, "stacks"),
    /** Start the session with everything that passes. */
    init: () => {
      let res: SequenceId | undefined;
      set.state(({ stacks, stackOrder }) => {
        // TODO: dedupe, randomize order
        const all = Array.from(dbStore.get.sequences().values());
        stacks.forEach((stack) => {
          stack.index = 0;
          stack.sequences = all
            .filter((seq) => Query.pass(stack.query, seq))
            .map((seq) => seq.id);
        });
        // TODO: should we just use set.pullFrom with get.current?
        const topStack = stacks.get(stackOrder[0]);
        if (topStack) {
          res = topStack.sequences[0];
          topStack.index = 1;
        }
      });
      return res;
    },
    /** Set ID as the current stack. */
    setCurrent: (id: StackId) =>
      set.state(({ stackOrder }) => {
        const idx = stackOrder.findIndex((id_) => id_ === id);
        if (idx !== -1) {
          stackOrder.splice(idx, 1);
        }
        stackOrder.unshift(id);
      }),
  }))
  .extendActions((set, get) => ({
    /** Pull from that stack. */
    pullFrom: (id: StackId) => {
      const res = get.topOf(id);
      set.setCurrent(id);
      set.editStack(id, (stack) => {
        stack.index = Math.min(stack.index + 1, stack.sequences.length - 1);
      });
      return res;
    },
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
