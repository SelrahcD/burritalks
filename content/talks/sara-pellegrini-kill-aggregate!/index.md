---
title: "Kill Aggregate!"
date: 2023-04-14T10:31:43.284Z
speakers: [Sara Pellegrini]
duration: 50min
draft: false
link: https://www.youtube.com/watch\?v\=DhhxKoOpJe0
youtube: DhhxKoOpJe0
tags:
- Architecture
- Databases
- Event Sourcing
---


Sara Pellegrini lists multiple problems with the aggregate patterns, which is one the most challenging tactical pattern to have a good grasp of because:

- they do not fit storytelling
- they put focus on the model instead of the behaviour
- they mix technical and business aspects
- they can be a big point of contention
- when using event sourcing, they are hard to refactor
- they make it difficult when we have to deal with transactions spanning across multiple aggregates


To deal with these challenges, Sara proposes an alternative based on associating events to multiple streams via a tagging system, allowing to get only the needed events to handle a command.