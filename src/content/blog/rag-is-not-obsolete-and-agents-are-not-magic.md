---
title: 'RAG Is Not Obsolete, and Agents Are Not Magic'
date: '2026-09-04'
excerpt: 'Why retrieval still beats bigger context windows, and why agent reliability comes down to planning discipline, not model size.'
tags: ['ai-engineering', 'rag', 'agents', 'llm']
sourceWikiPage: 'RAG and Agent Architectures'
---

Every few months someone argues that RAG is dead because context windows keep growing. It is not, and the reasons are practical rather than ideological. Data volume grows faster than context length ever will, a longer context does not guarantee the model actually uses everything in it (the "lost in the middle" effect is real), and every extra token costs latency and money. A rough rule of thumb from Anthropic: skip RAG only if your entire knowledge base fits under roughly 200K tokens, about 500 pages. Past that, retrieval is not a workaround, it is the architecture.

## Picking a retrieval strategy

The retrieval layer has three real options. Sparse methods like BM25 are fast, cheap, and strong out of the box, but they miss semantic matches. Dense embedding-based retrieval captures meaning through approximate nearest neighbor search (HNSW, IVF, libraries like FAISS or ScaNN), but it is expensive, sometimes 20 to 50 percent of a company's model API spend, and it can blur exact matches like error codes or product IDs that sparse search would catch cleanly. Hybrid search, combining both and merging results with reciprocal rank fusion, is usually the pragmatic default.

Chunking strategy and reranking matter as much as the retrieval algorithm itself. There is no universally correct chunk size, fixed-size, recursive, and format-specific splitters all trade off differently, and the common pattern is to retrieve broadly and cheaply, then rerank a small candidate set with a more expensive, more precise pass.

Hybrid search, at a conceptual level, looks like this:

```
sparse_results = bm25_search(query, top_k=50)
dense_results = embedding_search(query, top_k=50)

merged_scores = {}
for rank, doc in enumerate(sparse_results):
    merged_scores[doc] += 1 / (k + rank)
for rank, doc in enumerate(dense_results):
    merged_scores[doc] += 1 / (k + rank)

final_results = sort_by_score(merged_scores, top_k=10)
```

That is reciprocal rank fusion: each retrieval method votes on a document by its rank rather than its raw score, so the two very different scoring scales (BM25 relevance vs. cosine similarity) never need to be reconciled directly.

## Agents fail differently than single-shot calls do

An agent is a model with tools and the ability to act on an environment across multiple steps, and RAG is technically a special case of it, the retriever is just one tool among others. The number that should worry anyone building an agent is compound error: if each step is 95 percent accurate, ten steps in sequence lands around 60 percent, and a hundred steps lands near 0.6 percent. This is why agents need stronger models than single-turn tasks, and why tool access, especially write actions like sending an email or executing a database write, raises the stakes of every individual mistake far above a read-only lookup.

The mitigation that actually works is separating planning from execution: generate a plan, validate it against heuristics, step limits, or an AI-judge review, and only then execute. Skipping this step is how you end up with an agent that runs wild, expensive, or simply wrong sequences of tool calls. In pseudocode, the shape of it is:

```
plan = llm.generate_plan(goal, available_tools)

if not passes_heuristics(plan):
    reject(plan)
elif exceeds_step_limit(plan):
    reject(plan)
elif not ai_judge_approves(plan):
    reject(plan)
else:
    for step in plan:
        result = execute(step)
        if result.failed:
            plan = llm.revise_plan(plan, failure=result)
```

That validation gate is the entire difference between an agent that occasionally makes a wrong call and one that occasionally executes a wrong call. It also generalizes naturally into a multi-agent setup, with distinct planner, validator, and executor roles instead of one model doing everything.

There is a real tradeoff in how granular a plan should be. A plan that names exact function calls is precise but brittle against any API change. A plan written in natural language survives change better but needs a separate translation step before it can actually run. Neither is strictly better, it depends on how often the underlying tools change.

## What this costs, and where the risk sits

For a team deciding whether to build a RAG or agent system, two numbers matter more than the architecture diagram. First, embedding-based retrieval is not free: dense search alone can eat 20 to 50 percent of a company's model API spend, which makes hybrid search, sparse first, embeddings only where they earn their cost, a cost decision as much as a technical one. Second, every agent step with a write action, sending an email, executing a database write, moving money, is not equivalent in risk to a read-only lookup, and that gap should show up in how much validation and human oversight gets built around it, not just in the prompt.

The build-vs-buy question follows a similar logic. LangChain, Haystack, and Semantic Kernel solve overlapping problems with different tradeoffs: Haystack ships a REST API deployment path out of the box, LangChain and Semantic Kernel do not, which matters if the goal is shipping a standalone service quickly versus embedding retrieval into an existing application. The safer default across all of this: reach for the simplest architecture that closes the task, hardcoded sequential chains where order needs to be exact and easy to test, agentic tool selection only where the flexibility is actually needed. Complexity added ahead of the requirement becomes a debugging cost later, not a capability now.

## What this means in practice

When evaluating whether a RAG or agent system is production-ready, the useful questions are not "does it work on the demo" but "what is the compound error rate over the expected number of steps" and "is there a validation gate before anything with side effects executes." Most agent failures trace back to one of three categories: bad planning (wrong tool, wrong parameters, goal not actually met), tool failure (right call, wrong output), or inefficiency (too many steps, too expensive). Naming which category a failure falls into is usually more useful than trying to fix it by upgrading the model.
</content>
