---
title: 'Scaling a Web App from One Server to Millions of Users'
date: '2026-09-13'
excerpt: 'The architecture evolution every growing system goes through: separating tiers, load balancing, caching, and sharding, with the cost tradeoffs at each step.'
tags: ['system-design', 'backend', 'scalability']
sourceWikiPage: 'Scaling Fundamentals (Zero to Millions)'
---

Most systems do not start distributed. They start as one server running the web app, the database, and the cache together, and that is the correct choice for a product with no users yet. The interesting part is not the end state, it is the sequence of changes a team makes as traffic grows, because each step solves a specific bottleneck and introduces a specific new cost. Understanding that sequence is what separates over-engineering a system for traffic that does not exist from scrambling to fix an outage that a known pattern would have prevented.

## Splitting the tiers

The first real step is pulling the database off the web server, so each can scale independently. This is also where the relational versus non-relational decision shows up. Non-relational stores earn their place when the workload needs very low latency, the data is not naturally relational, or the volume is large enough that schema flexibility matters more than joins.

From there, scaling the web tier itself has two options: vertical, which means a bigger machine, and horizontal, which means more machines behind a load balancer. Vertical scaling has a hard ceiling and no failover. Horizontal scaling is the one that holds up at real scale, and it depends on the web tier being stateless, meaning session state lives in shared storage rather than on any one server, so a load balancer can route a request to any healthy instance.

## Making reads fast and cheap

Once there is more than one server, replication and caching solve two different problems. Database replication (a primary for writes, replicas for reads) protects against data loss and spreads read load, at the cost of eventual consistency between primary and replica during a failover. Caching solves the cost of repeated expensive reads. A simple version looks like this:

```
function get(key):
    value = cache.lookup(key)
    if value exists:
        return value
    value = database.query(key)
    cache.store(key, value, ttl)
    return value
```

This is a read-through cache, and it is deceptively simple to describe and genuinely hard to run well. The two failure modes that matter in production are picking a TTL (too short and the cache barely helps, too long and users see stale data) and keeping cache and database from drifting apart, since the two writes are not part of one transaction. A CDN is the same idea applied to static assets, pushed geographically closer to the user instead of just closer in latency to the database.

## When one database is not enough

Sharding is the horizontal-scaling equivalent for the data tier: split one large database into shards holding a subset of the data each, using a partition key such as `hash(user_id) % shard_count`. It solves the problem that vertical scaling a database eventually hits diminishing returns, both in cost and in blast radius from a single machine failing. The tradeoffs are real, though: resharding when a shard fills up is disruptive unless the key was chosen with consistent hashing in mind, a small number of unusually active keys can overload a single shard even when the rest of the cluster has headroom, and joins across shards typically get replaced by denormalized data instead.

## Why this progression matters for a growing team

None of these steps are free, and that is the actual decision a business is making at each point in this sequence, not a purely technical one. A load balancer and a read replica are cheap insurance early on. Sharding a database, running multiple data centers, or introducing a message queue for async processing are meaningfully more operational overhead, and they are worth it exactly when a specific bottleneck is measured, not anticipated. Teams that shard too early pay for complexity they do not need yet; teams that wait too long find out the hard way, during an incident, which tier was the actual constraint. The useful skill is not memorizing the architecture diagram, it is recognizing which step in this sequence corresponds to the bottleneck a system actually has right now.
