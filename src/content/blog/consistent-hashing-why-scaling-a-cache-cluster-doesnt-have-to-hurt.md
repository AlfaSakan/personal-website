---
title: 'Consistent Hashing: Why Scaling a Cache Cluster Doesn''t Have to Hurt'
date: '2026-09-05'
excerpt: 'How consistent hashing keeps most keys in place when servers are added or removed, and why that matters for cache and database clusters at scale.'
tags: ['system-design', 'distributed-systems', 'backend']
sourceWikiPage: 'Consistent Hashing'
---

Distributing data across a fleet of servers sounds simple until you have to add or remove one. The naive approach, `serverIndex = hash(key) % N`, works fine as long as the number of servers N stays fixed. The moment N changes, almost every key remaps to a different server, not just the ones that belonged to the server you added or removed. In a cache cluster, that shows up as a storm of cache misses hitting the database all at once, right when the cluster is already in flux.

Consistent hashing, introduced by Karger et al. at MIT, solves this with one guarantee: when the hash table is resized, on average only k/n keys need to move, where k is the number of keys and n is the number of slots. That is a fraction of what naive modulo hashing forces on you.

## How the Ring Works

Instead of a flat array of buckets, consistent hashing bends the hash space into a ring (for example, SHA-1 output wrapped from 0 to 2^160-1). Both servers and keys get hashed onto positions on this ring using the same hash function, no modulo involved.

To find which server owns a key, walk clockwise from the key's position until you hit the first server. That server owns the key.

```
function lookup(key, ring):
    position = hash(key)
    for each server in ring, sorted by position:
        if server.position >= position:
            return server
    return ring.first_server  // wrap around

function add_server(new_server, ring):
    insert new_server at hash(new_server) on ring
    predecessor = previous server counter-clockwise from new_server
    // only keys between predecessor and new_server move
    move keys in (predecessor, new_server] to new_server

function remove_server(server, ring):
    successor = next server clockwise from server
    // only keys owned by the removed server move
    move keys owned by server to successor
```

Adding a server only pulls keys from the range between the new server and its counter-clockwise neighbor. Removing a server only displaces the keys it owned, which move to the next server clockwise. Every other key on the ring stays exactly where it was.

## Two Problems the Basic Version Has

Placing servers on the ring by hashing their IP or hostname introduces two failure modes:

1. **Uneven partition sizes.** Since placement is effectively random, one server can end up owning a much larger share of the hash space than another.
2. **Non-uniform key distribution.** With enough bad luck in the random placement, most keys can land on one server while others sit nearly empty.

The fix is virtual nodes: each physical server is represented by many points on the ring instead of one (server 0 becomes s0_0, s0_1, s0_2, and so on). More virtual nodes means a smaller standard deviation in load. In practice, 100-200 virtual nodes per server brings load standard deviation down to 5-10% of the average. The cost is metadata: more virtual nodes means more positions to track and look up.

## Where This Shows Up in Production

Consistent hashing is not a theoretical exercise. It is the partitioning strategy behind Amazon DynamoDB, Apache Cassandra's data distribution, Discord's message routing, Akamai's CDN, and Google's Maglev network load balancer.

It also solves a subtler problem: hotspot keys. If a handful of high-traffic items (a few celebrity accounts on a social app, for instance) happen to hash onto the same shard, that shard gets overloaded even though the rest of the cluster is fine. Spreading load across many virtual nodes per server reduces the odds of that kind of collision concentrating on one machine.

## Why This Matters Beyond the Interview Question

Consistent hashing usually comes up as a system design interview topic, but the underlying tradeoff is a real operational one: how much does it cost to scale your data tier up or down. Without it, every capacity change is a coordinated, risky event where most of your cache invalidates at once and your database takes the hit. With it, scaling a cluster becomes closer to routine, which is exactly what you want when traffic is unpredictable and you cannot afford a maintenance window every time you resize.

For teams evaluating whether to build custom partitioning logic or lean on a data store that already implements this (DynamoDB, Cassandra), the practical question is whether your access patterns can tolerate eventual key redistribution during scaling events, or whether you need the stronger guarantees a purpose-built system already provides out of the box.
