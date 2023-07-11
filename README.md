fix:

- stacks
  - show stacks on side only if in-session
    - i need space for my music player!
  - make stacks prettier
  - i should still be able to switch between sequences out of session
  - want "global" filters, for all the stacks
  - want to reorder stacks (out of session)
- seqview
  - "back" should just be back within the stack, not using navigate(-1)
  - don't crash when i back from seq 1 or forward from last seq
  - investigate local state changes when moving between sequences
    - possible cause of errors?
  - editing sequence metadata resets local state
- debt
  - search -> filter
  - types.ts -> db.ts?
  - reorganize component names lol
    - a view renders, and does not call apis
    - a form edits
    - generic smaller ui
    - containers
  - definitely not use ag grid, it resorts every time something changes...
- tags
  - autocomplete shows id, not name (hotfixed)
  - i can't remove autotags

feat:

- sessions
  - resuming sessions
- header
  - saving queries
  - switching between saved queries
  - editing saved queries, deleting saved queries
- dbview
  - editing categories
  - edit visible columns
  - sorting columns, persist
  - show number selected
- seqview
  - heads/sides changing
- filters
  - restructure filter types
    - support numerical filters
  - filter by comment
  - date, date comparators

stretch:

- formations:
  - should draw things in a normalized-ish way
  - should let me click at people to label them, add colors
- call metadata:
  - parse calls
  - highlight less frequent calls in the level/tip view, use them to name sequences without comments
    - maybe we can even highlight on-level calls or something idk
  - call frequencies, call length, measure things
  - reassign sequence levels based on highest call?
- sequence metadata:
  - measure how long it takes, how long each call takes
- keyboard shortcuts
  - customizable?

prior art:

- https://www.ceder.net/csds/
  - https://www.ceder.net/helpdb/viewsingle.php?UniqueId=435
- see interviews with andy/john
