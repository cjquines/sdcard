import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { DB } from "./types";
import { parseFile } from "./parser";
import { createEnhancedJSONStorage } from "./storage";
import { DEFAULT_METADATA } from "./metadata";

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
        state.sequences.set(seq.id, seq);
      }
    });

    return newSequences.length;
  },
}));

const rootStore = {
  db: dbStore,
};

export const useTracked = () => mapValuesKey("useTracked", rootStore);
export const actions = mapValuesKey("set", rootStore);
