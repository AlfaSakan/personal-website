---
title: 'Rate Limiter Design: Choosing the Right Algorithm'
date: '2026-09-02'
excerpt: 'A comparison of five rate limiting algorithms and where each one breaks down in a distributed system.'
tags: ['system-design', 'backend', 'distributed-systems']
sourceWikiPage: 'Rate Limiter Design'
---

Rate limiting sounds like a solved problem until you have to pick an algorithm and defend the choice. There are five common approaches, and each one trades off memory, accuracy, and burst tolerance differently. Knowing which one to reach for, and why, matters more than knowing that rate limiting exists.

## Why rate limit at all

Three reasons come up in practice. First, protecting against resource starvation from bad actors or runaway clients, the classic DoS case. Second, cost control: fewer servers needed, and a hard requirement when you pay per call to a third-party API for something like credit checks or payment processing. Third, general overload protection against bots or misbehaving clients.

Client-side throttling is not reliable since a client can be spoofed or bypassed entirely, so the limiter has to sit server-side. In practice that means either baking it into the API server or, more commonly, placing it as middleware in front of the server so it rejects with an HTTP 429 before the request does any real work. In a microservice setup this usually lives in the API gateway, alongside SSL termination, auth, and IP whitelisting.

## Build it, or buy it

The algorithm choice matters, but the bigger decision often comes earlier: build this from scratch or lean on what already exists. Most cloud API gateways ship a rate limiter out of the box, alongside SSL termination, auth, and IP whitelisting, so the practical guidance is to start by evaluating the stack already in place, then let the business requirement pick the algorithm, not the other way around. Building a custom limiter buys full control over the algorithm and its parameters, at the cost of more engineering time; a managed gateway ships faster but constrains which algorithms and tuning knobs are available. For a team validating a product, the managed path is usually the right call. For a platform paying per call to a third-party API for something like credit checks or payment processing, the cost of getting the algorithm wrong is high enough that the extra engineering time to build and tune it precisely is worth spending.

## The five algorithms

**Token bucket**, used by Amazon and Stripe, is the default choice. A bucket holds a fixed number of tokens, a refiller adds tokens at a set rate, and each request consumes one. Simple, memory-efficient, and it tolerates short bursts well. The downside is that the two parameters (bucket size, refill rate) are not always intuitive to tune correctly.

A minimal in-memory implementation in Go, single instance, mutex-protected:

```go
type TokenBucket struct {
	mu         sync.Mutex
	capacity   int64
	tokens     int64
	refillRate int64 // tokens added per second
	lastRefill time.Time
}

func NewTokenBucket(capacity, refillRate int64) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

func (b *TokenBucket) Allow() bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	elapsed := time.Since(b.lastRefill).Seconds()
	if refill := int64(elapsed * float64(b.refillRate)); refill > 0 {
		b.tokens = min(b.capacity, b.tokens+refill)
		b.lastRefill = time.Now()
	}

	if b.tokens == 0 {
		return false
	}
	b.tokens--
	return true
}
```

The middleware just calls `Allow()` per request and returns 429 on `false`. The catch, and the reason the distributed section below matters, is that this version only works within a single process. A `sync.Mutex` and an in-memory struct do not survive across multiple rate limiter instances, which is exactly the synchronization issue described next.

**Leaking bucket**, used by Shopify, processes requests at a fixed outflow rate through a FIFO queue. It gives you a stable, predictable processing rate, which is valuable when downstream systems need steady load. The tradeoff is that a burst fills the queue with old requests and delays anything new, and like token bucket it needs careful parameter tuning.

**Fixed window counter** divides time into fixed windows, each with its own counter. It is easy to reason about and cheap to store, but it has a real flaw: the boundary burst problem. A limit of 5 requests per minute can let through nearly double that if traffic clusters at the edge between two adjacent windows, since each window resets independently.

**Sliding window log**, typically backed by a Redis sorted set, stores a timestamp per request and counts how many fall inside the current rolling window. It is the most accurate of the five, never exceeding the limit in any rolling window, but it pays for that accuracy in memory, since even rejected requests can end up logged.

**Sliding window counter** is a hybrid that approximates the sliding log using fixed window counts. It weights the previous window's count by the overlap percentage with the current window: for a limit of 7 requests per minute, 5 requests in the prior minute, 3 in the current minute so far, and 30% into the current window, the estimate is `3 + 5 x 0.7 = 6.5`, rounded down to 6, which is still under the limit. It is only an approximation, not exact, but Cloudflare's own experiment found just 0.003% of requests misclassified across 400 million, which is good enough for most production use.

## What breaks in a distributed system

Two problems show up once you have more than one rate limiter instance:

Race conditions happen when concurrent requests read a counter before either writes back, causing undercounting. Locking is the obvious fix but slows things down; a Lua script executed atomically in Redis, or a Redis sorted set, avoids the lock while staying correct.

Synchronization is the other issue: with multiple stateless rate limiter instances, requests from the same client can land on different instances that do not share state. Sticky sessions are a tempting fix but do not scale well. A centralized store like Redis, shared across all instances, is the more robust answer.

## Implementation notes that matter

Redis is the standard choice for the counter store, using `INCR` to bump the count and `EXPIRE` to auto-clear it after the window closes, since an in-memory cache is far faster than hitting a database on every request. Respond to clients with `X-Ratelimit-Remaining`, `X-Ratelimit-Limit`, and `X-Ratelimit-Retry-After` headers so well-behaved clients can back off on their own before hitting a wall.

On the monitoring side, treat the rate limiter as a system that needs tuning over time, not a fire-and-forget config. If legitimate requests are getting rejected too often, loosen the rules. If traffic has a real burst pattern, like a flash sale, token bucket's burst tolerance is usually a better fit than a strict fixed window.

The deeper lesson here is one that generalizes past rate limiting: the "correct" algorithm depends entirely on which tradeoff you can afford, accuracy versus memory, burst tolerance versus predictability. Five algorithms exist because five different sets of constraints exist, not because four of them are wrong.
