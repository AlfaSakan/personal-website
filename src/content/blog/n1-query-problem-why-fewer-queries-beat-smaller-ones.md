---
title: 'The N+1 Query Problem: Why Fewer Queries Beat Smaller Ones'
date: '2026-09-23'
excerpt: 'A common database performance bug, why it is slow, and how to fix it with a single query instead of one query per record.'
tags: ['backend', 'databases', 'performance']
sourceWikiPage: 'N+1 Query Problem'
---

The N+1 query problem is one of the most common performance bugs in database-driven applications, and one of the easiest to introduce by accident. It happens when code runs one query to fetch a list of records, then runs another query per record inside a loop to fetch related data. For N records, that is N+1 queries where one would do.

## Why more, smaller queries are slower

The intuition that many small queries are lighter than one complex query is wrong in practice. Every query is a round trip to the database: send the query, the database executes it, the result comes back. That round trip, not the complexity of the query itself, is what costs time. A single well-formed query, even a complex one, gets optimized by the database engine and only pays for one round trip.

The difference is not marginal. A dataset of 800 items across 17 categories, fetched with one query for categories plus 17 follow-up queries for items, took over a second. The same data fetched with a single JOIN took about 0.16 seconds, roughly 10x faster. At production scale, thousands or millions of records, that gap is the difference between an acceptable load time and a request that times out.

## The pattern, and the fix

```
// N+1: a query inside a loop
categories = query("SELECT * FROM categories")
for each category in categories:
    items = query("SELECT * FROM items WHERE category_id = category.id")
    render(category, items)

// Fix: one query with a JOIN
rows = query("
    SELECT c.id, c.name, i.id, i.name
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    ORDER BY c.name
")
group rows by category, render
```

The `LEFT JOIN` matters here, not just `JOIN`: it keeps categories with zero items in the result set instead of silently dropping them.

Not every case needs the aggregation pushed all the way into SQL. If the requirement is something like a count of items per category alongside the item list itself, a `GROUP BY` query works, but so does a simpler approach: run one JOIN query that returns all the raw rows, then build a keyed data structure (a map from category to its items) in application code. Either way it is still one round trip to the database. Deciding whether an aggregation belongs in SQL or in application code is a readability tradeoff, not a performance one, once the query count is fixed at one.

## Catching it before it ships

N+1 queries are easy to miss in code review because each individual query looks reasonable in isolation. The bug only shows up as a pattern: dozens of near-identical queries firing per request. Two signals catch it reliably. First, query count per request: a request that fires ten or a hundred queries where a handful would do is almost always fetching related data in a loop. Second, the ratio of rows read to rows returned: a real N+1 case will read far more rows across all its queries than it ultimately returns, since each small query pays its own overhead. Frameworks with an ORM layer, like Laravel, can enforce this directly, for example throwing on any lazy-loaded N+1 access outside production so it fails loudly in development instead of showing up as a slow endpoint later.

## Why it matters beyond the query itself

This is one of the cheapest performance wins available in a codebase: no new infrastructure, no caching layer, just restructuring how data is fetched. It also compounds, because an N+1 pattern that is barely noticeable with 20 test records becomes a timeout once a table has 20,000 rows in production. Catching this class of bug early, before a schema grows, is generally far cheaper than debugging a slow endpoint under real traffic later.
