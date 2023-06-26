fix:

- don't use date-fns, holy it pollutes the namespace...
- get a proper CSS-in-JS solution
- fix silly parser shenanigans
    - (like making it work with non-keep-all-pictures sequences)

feat:

- custom json representation...
- level view:
    - cards: date, comment/first call, length, idk
    - allow sorting into tips (drag and drop)
    - a tip toolbar, "unsorted", "tip 1", "tip 2", etc.
    - clicking a tip will open a column that you can drag cards onto
- tip view:
    - sequence 0 should always be just "at home"
    - numbered list of sequences, going horizontally: comment, list of calls truncated
    - can drag to rearrange
- sequence view:
    - more cards, in a filmstrip view kinda, going from top to bottom
    - each card has LARGE CALL NAME, then formation picture underneath post-call, maybe warnings too
    - the next card should be visible below (and the previous card not super visible)
    - UP and DOWN keys for prev/next call
    - overview of the tip on the top of the cards
    - navigation between sequences (LEFT and RIGHT)
    - overview of sequence to the left of the cards
    - metadata to the right of the cards (adding notes live, who's who, time of tip, time of sequence, time of call)
- card:
    - should draw things in a normalized-ish way
    - should let me click at people to label them, add colors
- sequence metadata:
    - more notes! other than just the comment! and things you can click like hard or easy or whatever
    - measure how long it takes, how long each call takes
- call metadata:
    - parse calls...
    - highlight less frequent calls in the level/tip view, use them to name sequences without comments
    - call frequencies
