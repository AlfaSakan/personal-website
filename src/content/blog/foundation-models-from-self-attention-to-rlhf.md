---
title: 'Foundation Models: From Self-Attention to RLHF'
date: '2026-09-09'
excerpt: 'How transformers, the pretrain-to-RLHF pipeline, and sampling actually work, and why it matters when you build on top of an LLM.'
tags: ['llm', 'ai-engineering', 'transformers']
sourceWikiPage: 'Foundation Model Fundamentals'
---

Most teams building on top of LLMs treat the model as a black box: send a prompt, get text back, tune the prompt until it behaves. That gets you far, but a few architectural facts change how you debug latency, pick a model, and decide when finetuning is worth the cost. Here is the mental model.

## Self-attention, not sequential processing

Before transformers, RNNs and LSTMs processed text token by token, carrying state forward through a single hidden vector, a bottleneck that made long sequences slow and lossy. The 2017 "Attention Is All You Need" paper replaced this with self-attention: every token is projected into a Query, Key, and Value vector, and each token attends to every other token directly, in parallel.

```
for each token t in sequence:
    Q[t] = t * W_query
    K[t] = t * W_key
    V[t] = t * W_value

for each token t:
    scores = [dot(Q[t], K[j]) for j in sequence]
    weights = softmax(scores)
    output[t] = sum(weights[j] * V[j] for j in sequence)
```

This is what let transformers scale: no more waiting on a single hidden state, and no upper bound on how far back a token can "look." Decoder-only models (GPT-style) use this for generation, encoder-only models (BERT-style) use it for classification and understanding, and encoder-decoder models (T5-style) use it for text-to-text transformation tasks like translation and summarization.

## Two inference phases, one latency bottleneck

Generating text with a transformer happens in two distinct phases. Prefill processes the entire input prompt in parallel and builds a KV cache, so it is compute-bound. Decode then generates output tokens one at a time, reusing that cache, and is memory-bandwidth-bound rather than compute-bound. This asymmetry is the real bottleneck behind LLM latency, and it is why techniques like quantization, speculative decoding, and batching target the decode phase specifically rather than raw FLOPs.

## The training pipeline: pretrain, then align

A foundation model goes through three stages. Pretraining trains from a random initialization on massive scraped text and consumes roughly 98% of total training compute; this is where the model's raw knowledge comes from. Supervised finetuning (SFT) then trains on curated (prompt, response) pairs to teach conversational behavior, essentially behavior cloning on top of a raw text-completion model. Finally, preference finetuning aligns outputs with human preference, either via RLHF (a reward model trained on pairwise comparisons, optimized with PPO) or the simpler DPO, which skips the separate reward model entirely.

The useful mental shorthand: pretraining gives the model its knowledge, and post-training does not add much new knowledge, it mostly determines whether that knowledge comes out in a useful, well-behaved form.

## Two failure modes worth designing around

Every LLM has two structural failure modes, not bugs to be patched away. Inconsistency: the same or similar prompt produces different outputs, mitigated by caching and locking sampling parameters, though hardware variance alone can still shift results. Hallucination: confident output not grounded in fact, driven partly by the model being unable to distinguish its own generated tokens from given facts, and partly by SFT training the model to imitate responses that assume knowledge it does not actually have.

## Why this matters when you're deciding how to build

None of this is academic if you're the one deciding whether to prompt-engineer, RAG, or finetune. Chinchilla scaling laws show that bigger is not automatically better per dollar. Prefill/decode asymmetry tells you why your latency problem probably will not be solved by a "faster" model alone. And knowing that hallucination is structural, not a bug in one particular model, changes the conversation with a client from "which model hallucinates less" to "what verification layer does this application need." That distinction is usually the difference between a demo and something safe to ship.
