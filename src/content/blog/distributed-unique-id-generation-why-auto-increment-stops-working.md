---
title: 'Distributed Unique ID Generation: Why Auto-Increment Stops Working'
date: '2026-09-06'
excerpt: 'Four approaches to generating unique IDs across many servers, and why Twitter Snowflake wins when you need them sortable.'
tags: ['system-design', 'backend', 'distributed-systems']
sourceWikiPage: 'Distributed Unique ID Generation'
---

A single database's `auto_increment` is a fine ID generator until there is more than one database. Once you shard a table or run multiple write nodes, two servers can hand out the same next integer to two different rows, and the whole guarantee falls apart. Distributed unique ID generation is the problem of producing IDs that stay unique, and ideally still sortable by creation time, once "the database" is no longer a single machine.

A typical requirement set looks like this: IDs must be unique, numeric, fit in 64 bits, be roughly time-ordered (newer IDs generally larger, not necessarily +1), and the system needs to sustain 10,000+ IDs per second. That combination rules out some of the simplest options.

## Four approaches, in order of how they fail

**Multi-master replication** keeps the familiar auto-increment but changes the step. If there are k database servers, each one increments by k instead of 1, so server 1 produces 1, k+1, 2k+1..., server 2 produces 2, k+2, 2k+2..., and so on. IDs never collide. The problem shows up when the cluster changes shape: adding or removing a database server means recomputing the step and offset for every remaining node, and IDs are no longer strictly increasing across servers as time passes. It scales in the sense that it works, but not in the sense that it tolerates growth.

**UUID** sidesteps coordination entirely. Each server generates a 128-bit identifier independently, with a collision probability low enough to ignore in practice, generating a billion UUIDs a second for about a hundred years yields roughly a 50% chance of one collision. It is trivial to scale since there is nothing to coordinate. The cost is that UUIDs are 128 bits against a 64-bit requirement, are not time-ordered, and are not guaranteed numeric, which matters if downstream systems (or a URL scheme, or a chat message ordering guarantee) expect a sortable integer.

**Ticket server** centralizes the auto-increment instead of distributing it: one dedicated database, à la Flickr's approach, acts as the single source of truth and every other service asks it for the next ID. It is numeric, simple, and adequate at small to medium scale. It is also a single point of failure, and the obvious fix, running several ticket servers, reintroduces the exact synchronization problem it was meant to solve.

**Twitter Snowflake** is the approach that actually satisfies the requirement set, by encoding structure directly into the 64 bits instead of relying on a shared counter anywhere.

## How Snowflake packs 64 bits

The ID is split into fixed-width sections, each carrying different information:

```
64-bit ID layout:
  bit 0        -> sign bit, always 0 (reserved)
  bits 1-41    -> timestamp, milliseconds since a custom epoch
  bits 42-46   -> datacenter ID (5 bits -> up to 32 datacenters)
  bits 47-51   -> machine ID (5 bits -> up to 32 machines per datacenter)
  bits 52-63   -> sequence number (12 bits -> up to 4096 per ms per machine)

function generate_id(machine_state):
  now = current_time_ms()
  if now == machine_state.last_ms:
    machine_state.sequence = (machine_state.sequence + 1) mod 4096
    if machine_state.sequence == 0:
      now = wait_for_next_ms(now)       # exhausted this ms, spin to the next
  else:
    machine_state.sequence = 0
  machine_state.last_ms = now

  id = (now - CUSTOM_EPOCH) << 22
  id |= machine_state.datacenter_id << 17
  id |= machine_state.machine_id << 12
  id |= machine_state.sequence
  return id
```

The timestamp section dominates the bit budget because sortability by creation time is the whole point. Datacenter ID and machine ID are fixed at process startup and must not change carelessly; reassigning a machine ID on a live node risks colliding with IDs it already generated. The sequence number resets to zero every millisecond and caps throughput at 4,096 IDs per millisecond per machine, which is generally more than enough headroom before you'd need more machines anyway. A 41-bit timestamp field caps out at roughly 69 years from the chosen epoch before a migration to a new epoch is needed, a problem for a future team, not the one shipping the first version.

## What actually needs attention in production

The bit-packing is the easy part. The parts that cause real incidents are:

**Clock synchronization.** The whole scheme assumes each machine's clock is roughly correct and monotonic. Clock drift or a backward jump on one node can produce IDs that appear older than IDs already issued, quietly breaking the sortability guarantee the entire design exists for. Network Time Protocol is the standard mitigation, and any production deployment needs to treat clock skew as an operational concern, not an edge case to shrug off.

**Section sizing is a tuning knob, not a fixed spec.** A high-throughput, short-lived service benefits from more sequence bits and fewer timestamp bits; a long-lived system with modest concurrency can do the opposite. The 41/5/5/12 split popularized by Twitter is a starting point tuned for Twitter's load, not a law of physics.

**This service is mission-critical by construction.** Every write path that needs a new ID depends on it, so it needs the same high-availability treatment as the primary datastore, not the treatment of a convenience utility. A ticket-server-style single point of failure defeats the purpose of choosing Snowflake over it in the first place.

## The business case for getting this right early

ID generation is the kind of decision that is cheap to make correctly on day one and expensive to migrate later, because the ID format tends to leak into URLs, client caches, external integrations, and anywhere else an identifier gets persisted or exposed. A team that picks auto-increment because it works in a single-node prototype, then scales to multiple write nodes without revisiting it, ends up doing a painful ID-format migration under production load instead of a design review on a whiteboard. For a system expected to shard or replicate writes eventually, it is worth deciding the ID strategy before the first production row is written, not after the first collision.
