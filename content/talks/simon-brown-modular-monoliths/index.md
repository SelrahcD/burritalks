---
title: "Modular Monoliths"
date: 2025-01-06T18:23:59.384Z
speakers: [Simon Brown]
duration: 47min
draft: false
link: https://www.youtube.com/watch?v=5OjqD-ow8GE
youtube: 5OjqD-ow8GE
tags:
- Architecture
- Development
- Micro-services
---


Simon Brown highlights the mismatch between architecture diagrams and real code.
This talks his based on Simon contributed "missing" chapter to Robert Martin's "Clean Architecture" book.
Simon describes different architectures (layered, by feature, port and adapter) with their advantage and inconvenient. He also proposes a new one, "component architecture".
More importantly he notes that when we look at these architectures we mostly can distinguish one from another.
He argues that there is a difference between code organization and encapsulation.
We tend to organize code using file structure but this does nothing for proper encapsulation because we over-use the public keyword. Everything is accessible to everything else.
Simon says that "The surface area of your internal public APIs should match your architectural intent": We should be using the packaging system of our languages (when we have one) to create real boundaries and keep private what was meant to be.
