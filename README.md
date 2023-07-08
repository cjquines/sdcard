fix:

- clicking does not pop sequence
- reorganize component names lol

feat:

- sessions
  - resuming sessions
  - maybe don't do the stack lol, just use an array and keep index
    - resort by "dissimilarity"
      - length of comment, number of comments, length of sequence, number of warnings
- header
  - saving queries
  - switching between saved queries
  - editing saved queries, deleting saved queries
- dbview
  - editing categories
  - edit visible columns
  - sorting columns, persist
  - show number selected
- between sequences:
  - show the next satisfying whatever query
    - maybe each has their own query box even?
  - auto-add a tag when going next (that's in the bottom of the sequence editor?)
  - heads/sides changing

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
