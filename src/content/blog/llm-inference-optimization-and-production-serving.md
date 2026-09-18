---
title: 'LLM Inference Optimization and Production Serving'
date: '2026-09-19'
excerpt: 'Where LLM latency and cost actually come from, and the model-level and serving-level techniques teams use to control both.'
tags: ['llm', 'inference-optimization', 'production-serving']
sourceWikiPage: 'LLM Inference Optimization and Production Serving'
---

Calling a model API feels instant in a demo. In production, at hundreds or thousands of concurrent requests, latency and cost stop being an afterthought and start being an architecture problem. The mechanics behind that shift are worth understanding before you pick a stack, because the wrong default can quietly triple your compute bill or blow through your latency SLO.

## What you're actually measuring

Two numbers matter for a single request: time to first token (TTFT, dominated by prefill over the input) and time per output token (TPOT, dominated by decode). Around 120ms per token or faster reads as human reading speed, which is "good enough" for most chat interfaces. Total latency is TTFT plus TPOT times the number of output tokens.

Across all users, throughput (output tokens per second) tracks compute cost directly. But raw throughput hides a problem: batching more requests together raises throughput while degrading TTFT and TPOT for everyone in the batch. That's why the more useful number is goodput, throughput restricted to requests that actually met their SLO. A system that looks efficient on paper can still be serving unusable responses.

## Model-level optimizations

These change the model itself and can affect output quality:

- **Quantization**: fewer bits per parameter. The most common and easiest lever; 8-bit and 4-bit are well established for post-training use.
- **Speculative decoding**: a small draft model proposes several tokens ahead, and the large target model verifies them all in parallel, in one pass, rather than generating token by token. The longest agreed-upon prefix gets accepted. It's lossless: output quality is identical to running the target model alone, only faster.

```
draft_tokens = small_model.propose(context, n=k)
verified = large_model.verify_parallel(context, draft_tokens)
accepted = longest_matching_prefix(draft_tokens, verified)
context.append(accepted)
if len(accepted) < k:
    context.append(large_model.correct_token(verified, len(accepted)))
```

DeepMind reported an 8x speedup running a 4B draft model against Chinchilla-70B with no quality loss. It's now standard in vLLM, TensorRT-LLM, and llama.cpp.

- **KV cache management**: the KV cache avoids recomputing key/value vectors for prior tokens during decode, but it grows linearly with sequence length and batch size, and at scale can dwarf the memory footprint of the model weights themselves. Architectural fixes (grouped-query or multi-query attention) and memory management techniques (PagedAttention, FlashAttention) both target this.

## Serving-level optimizations

These leave the model untouched and change how requests are scheduled:

- **Continuous batching**: finished requests are returned immediately and new ones fill the freed capacity, so a short request never waits behind a long one in the same static batch. This is the current standard, replacing static and dynamic batching.
- **Separating prefill and decode**: running both phases on the same GPU means a prefill spike starves an in-progress decode, degrading TPOT. Splitting them across dedicated instances (the DistServe approach) improves throughput while keeping latency under SLO.
- **Prompt caching**: reusing overlapping prompt segments, like a shared system prompt or repeated document context, instead of reprocessing them. Anthropic has reported up to 90% cost reduction and 75% latency reduction for large cached documents.

## The layers around the model call

A production LLM feature is rarely just "prompt in, response out." It typically grows in this order: context enrichment (RAG or tool calls), input and output guardrails, a router that sends each query to the cheapest adequate model, a cache layer (exact-match or embedding-based semantic caching), and finally, if the system takes actions, an agent loop with its own safety review. Each layer adds latency and cost, so each one has to earn its place against a measured failure mode, not added by default.

## Why this matters beyond the infra team

Every optimization here is really a cost-vs-quality-vs-latency negotiation, and that negotiation has direct business consequences. A chatbot with a 3-second TTFT loses users regardless of answer quality. A cache that leaks a personalized answer under a generic-looking query is a privacy incident, not just a bug. And model drift, where the provider silently updates a model behind a stable-looking API, can degrade an integration without a single line of your code changing. Teams that treat inference serving as a one-time integration rather than an ongoing operational surface tend to discover these costs after they've shipped, when they're much more expensive to fix.
