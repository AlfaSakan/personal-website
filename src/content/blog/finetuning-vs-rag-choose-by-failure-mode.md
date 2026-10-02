---
title: 'Finetuning vs RAG: Choose by Failure Mode, Not by Habit'
date: '2026-10-02'
excerpt: 'A practical rule for deciding between finetuning and RAG, and how LoRA and data quality keep finetuning affordable.'
tags: ['ai-engineering', 'llm', 'finetuning', 'lora']
sourceWikiPage: 'LLM Finetuning and Dataset Engineering'
---

When an LLM feature underperforms, the first instinct is often to finetune the model. In most cases that is the more expensive and riskier fix. A useful rule of thumb: finetune for form, use RAG for facts.

## Diagnose the failure first

Information failures, such as missing or outdated knowledge and hallucinated facts, are a retrieval problem. In one study on questions about recent events, RAG beat finetuning by a wide margin. RAG on top of the base model even outperformed RAG on top of the finetuned model, which suggests that finetuning for one skill can quietly degrade others.

Behavioral failures are different. The facts are right, but the tone is wrong, or the output does not follow the required format. Those are finetuning problems, and rare custom syntax or DSLs benefit the most. Common formats like JSON or YAML usually work without any special training.

If both problems exist, start with RAG. It is cheaper and needs no training data or hosting. A sensible order is: prompt engineering, a few in-prompt examples, simple term-based RAG, and only then branch by failure mode.

## Why finetuning has a real cost

Training memory is weights plus activations plus gradients plus optimizer state, and the last two scale with the number of trainable parameters. Full finetuning of a 13B model with Adam needs roughly 78GB for gradients and optimizer state alone, more than a single high-end GPU holds. Beyond hardware, there is task interference, ongoing maintenance as base models improve, and the risk of being overtaken by a general model. BloombergGPT, built for finance at a compute cost of $1.3 to $2.6 million, was beaten on financial benchmarks by GPT-4, released the same month.

## LoRA: train less, keep the quality

Parameter-efficient finetuning attacks the memory problem directly by reducing what is trainable. LoRA is the most widely adopted approach. Instead of updating a large weight matrix W, it trains two small matrices A and B and merges them back afterward:

```
# setup
W = pretrained_weight          # frozen, large
A, B = small_matrices(rank=r)  # trainable, r typically 4 to 64

# training: only A and B receive gradients
output = W @ x + (alpha / r) * (B @ (A @ x))

# after training: merge once, no extra inference cost
W_merged = W + (alpha / r) * (B @ A)
```

Because the update is merged into W, inference latency does not change. A related pattern is multi-LoRA serving: keep one shared base model and swap small adapters per customer or task, which cuts storage sharply compared with keeping a full finetuned copy for each. QLoRA goes further, combining 4-bit quantized base weights with paged optimizers so a 65B model can be finetuned on a single 48GB GPU.

## Data quality beats data volume

The curation lesson is just as important as the training method. LIMA finetuned a 65B Llama on only 1,000 carefully curated pairs, and it matched or beat GPT-4 in 43% of human-judged comparisons. Quality, coverage, and quantity all matter, but a small clean dataset outperforms a large noisy one. A good starting point is a pilot of around 50 examples to check whether there is signal, then plotting performance against dataset size to see where returns diminish.

Synthetic data can fill gaps cheaply, but it has limits. Distilled models can imitate a teacher's style without its underlying capability, and training recursively on AI-generated data can degrade a model over generations. Mixing synthetic and real data avoids most of this.

Data processing pays off too. Databricks reported that stripping leftover Markdown and HTML improved accuracy by 20% and cut token length by 60%, and Anthropic found that repeating just 0.1% of training data 100 times degraded an 800M model to roughly 400M-model performance.

## What it means for a team

The business takeaway is about sequencing. Finetuning has upfront costs in data, ML expertise, and serving infrastructure, plus continuing maintenance. It makes sense when a narrow, stable task justifies it, for example a small finetuned model beating a much larger general one on a specific job. For anything driven by changing knowledge, RAG is the cheaper default. Choosing the wrong one means paying for training that does not fix the actual failure.
