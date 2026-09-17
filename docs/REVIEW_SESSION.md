# Review sessions

The Review route loads AttemptEvents and ReviewEvents, rebuilds the Error Bank and ReviewCards, and materializes the card cache. The due queue includes cards whose `due` is at or before the current instant, ordered by due time and then stable card ID.

For Part 1 the session shows a concise sentence containing the gap, waits for the learner to recall, reveals the correct option and explanation, and then presents four large touch targets: Again, Hard, Good, and Easy. The app never converts a practice-correct answer into Good automatically.

After each rating the event is appended locally and the next card is shown. Completion reports the number reviewed and the rating distribution. There is no gamification, adaptive queue weighting, or network dependency. The Error Bank remains browsable separately within the Review page, including recovered records whose card history is retained.
