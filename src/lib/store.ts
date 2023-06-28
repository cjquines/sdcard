import {
  CreateStoreOptions,
  createStore as createStoreUnwrapped,
  mapValuesKey,
} from "@udecode/zustood";
import { DB } from "./types";
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
    dances: [],
    tips: [],
    sequences: [],
  },
  {
    persist: { enabled: true, name: "db" },
  }
)
  .extendSelectors((state) => ({
    /** Get all sequences across all of db. */
    allSequences: () => [
      ...state.dances
        .flatMap((dance) => dance.tips)
        .flatMap((tip) => tip.sequences),
      ...state.dances.flatMap((dance) => dance.sequences),
      ...state.tips.flatMap((tip) => tip.sequences),
      ...state.sequences,
    ],
  }))
  .extendActions((set, get) => ({
    /**
     * Add a bunch of sequences to current db, removing duplicate times.
     * Returns number of sequences added.
     */
    importSequences: async (file: File) => {
      const text = await file.text();
      const existingTimes = new Set(
        get.allSequences().map((seq) => seq.date)
      );
      // TODO: we might eventually want to make this async
      const newSequences = parseFile(text).filter(
        (seq) => !existingTimes.has(seq.date)
      );
      set.sequences([...get.sequences(), ...newSequences]);
      return newSequences.length;
    },
  }));

const rootStore = {
  db: dbStore,
};

export const useTracked = () => mapValuesKey("useTracked", rootStore);
export const actions = mapValuesKey("set", rootStore);
