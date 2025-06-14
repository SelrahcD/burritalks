---
title: "All our aggregates are wrong"
date: 2025-06-14T06:20:11.812Z
speakers: [Mauro Servienti]
duration: 58min
draft: false
link: https://www.youtube.com/watch?v=hev65ozmYPI
youtube: hev65ozmYPI
tags:
  - Architecture
---


Mauro Servienti presents a robust strategy for decoupling distributed systems while eliminating the need for complex synchronization between subsystems.
His approach centers on a fundamental principle: each service maintains exclusive ownership of its domain data, ensuring clear boundaries and responsibilities.

The solution employs two complementary techniques to maintain system coherence.
View Model Composition aggregates data from multiple services to create unified, comprehensive views for users, seamlessly bringing together information that spans service boundaries.
Conversely, View Model Decomposition handles the inverse challenge—taking single incoming requests and intelligently distributing the relevant data portions to their respective owning services.

To address the critical challenge of maintaining system consistency during service failures, Mauro demonstrates how Command Query Responsibility Segregation (CQRS) patterns provide resilience.
By implementing request tracking through stored request identifiers, the system can reliably detect failures and execute compensating operations, ensuring data integrity across the distributed architecture even when individual services become unavailable.