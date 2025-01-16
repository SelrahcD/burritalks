---
title: "Decomposition Patterns"
date: 2025-01-22T14:11:28.772Z
speakers: [Mark Richards]
duration: 59min
draft: false
link: https://www.youtube.com/watch?v=wiWjX9yaXTY
youtube: wiWjX9yaXTY
tags:
- Architecture
- Micro-services
---


Mark Richards shares his list of patterns for moving from a monolithic to a micro-services architecture in this talk.
In contrast to most other approaches based on domain understanding, he proposes starting from a technical perspective, right from the code.
Looking at the code and seeing how you can group things logically to reduce coupling is the name of the game.
To do this, look at the size of your modules, make sure that some of them aren't way bigger than others, group what is reused across multiple packages in a shared package, flatten your package hierarchy to have a better view of the situation and help you decide how to create a coherent grouping.
Only then, you can extract things and start playing over the network.