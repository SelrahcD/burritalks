---
title: "Transactions: myths, surprises and opportunities"
date: 2021-02-03T08:55:58.312Z
speakers: [Martin Kleppmann]
duration: 41min
draft: false
link: https://www.youtube.com/watch?v=5ZjhNTM8XU8
youtube: 5ZjhNTM8XU8
tags:
- Micro-services
- Databases
---


Martin Kleppman explains relational databases characteristics and their different isolations levels. 

He shows which issues can be prevented by databases running with a read committed isolation level, the default on most systems, and which ones can't.

He then describes what it takes to achieve serialization, the maximum isolation level, which explains why it's slow.

He concludes that with a complex system composed of multiple databases, even serializable level is not enough because it doesn't consider the causality of actions made on several databases.