import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { DB, Sequence, SequenceId } from "./types";
import { parseFile } from "./parser";
import { createEnhancedJSONStorage } from "./storage";
import { DEFAULT_METADATA } from "./metadata";
import { SearchOption } from "./search";
import { StoreApi } from "zustand";

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
    sequences: new Map(),
    ...DEFAULT_METADATA,
  },
  {
    persist: {
      enabled: true,
      name: "sdcard-db",
      storage: createEnhancedJSONStorage(() => localStorage),
    },
  }
)
  .extendSelectors((state) => ({
    /** Get sequence with given ID. */
    getSeq: (seqId: SequenceId) => state.sequences.get(seqId),
  }))
  .extendActions((set, get) => ({
    /** Edit a sequence. */
    editSeq: (seqId: SequenceId, edit: (seq: Sequence) => void) => {
      set.state((state) => {
        const sequence = state.sequences.get(seqId);
        if (sequence) edit(sequence);
      });
    },
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
          state.sequences.set(seq.id, seq);
        }
      });

      return newSequences.length;
    },
  }));

const searchStore = createStore<{
  options: SearchOption[];
}>("search", {
  options: [],
})
  .extendSelectors((state) => ({
    /** Does this sequence pass all (non-partial) filters? */
    pass: (seq: Sequence) =>
      state.options.every(
        (option) =>
          SearchOption.isPartial(option) || SearchOption.pass(option, seq)
      ),
  }))
  .extendSelectors((_, get) => ({
    /** Give n suggestions for the sequence after curSeq. */
    next: (curSeq: Sequence, n: number) => {
      const result = [];
      for (const seq of dbStore.get.sequences().values()) {
        if (result.length === n) break;
        if (seq.id === curSeq.id) continue;
        if (get.pass(seq)) result.push(seq);
      }
      return result;
    },
  }));

const rootStore = {
  db: dbStore,
  search: searchStore,
};

// oops bad type :(
const useStore = (mapValuesKey("useStore", rootStore) as unknown) as {
  [k in keyof typeof rootStore]: StoreApi<typeof rootStore[k]>;
};
export const subscribe = mapValuesKey("subscribe", useStore);
export const useTracked = () => mapValuesKey("useTracked", rootStore);
export const store = mapValuesKey("get", rootStore);
export const actions = mapValuesKey("set", rootStore);
