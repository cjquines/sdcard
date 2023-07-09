fix:

- stacks
  - show stacks on side only if in-session
  - make stacks prettier
- debt
  - search -> filter
  - types.ts -> db.ts?
  - reorganize component names lol

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
