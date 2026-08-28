---
title: "Starting my journey blog"
date: "2026-08-28"
excerpt: "Why I'm starting to write about my journey as a software engineer — the systems I build, the mistakes I make, and what I learn along the way."
tags: ["journey", "meta"]
---

Welcome to my blog. I've been building software for a few years now — microservices, event-driven pipelines, full-stack apps — and most of what I've learned lives in my head or in commit messages nobody reads. This blog is my attempt to change that.

## Why write?

Three reasons:

1. **Writing forces clarity.** If I can't explain a design decision in plain words, I probably don't understand it as well as I think.
2. **A public notebook compounds.** Future me will thank present me for documenting the "why" behind the systems I build.
3. **It might help someone else.** Most of what I know came from other engineers writing things down.

## What to expect

I'll write about the decisions behind the systems I build — things like *why I chose Neo4j for a social graph*, *how I keep heavy CSV processing off the request path in InsightFlow*, and *what broke the first time I wired up Kafka consumers*.

Not tutorials. Decisions, trade-offs, and scars.

## A small taste

Here's the kind of thing I mean — a snippet from a recent project where a queue kept a slow job from blocking API requests:

```ts
// Producer: acknowledge fast, process slow
app.post("/datasets", async (req, res) => {
  const { id } = await saveDatasetMetadata(req.body);
  await queue.publish("dataset.ingest", { datasetId: id });
  res.status(202).json({ datasetId: id, status: "queued" });
});
```

The client gets an answer in milliseconds; the heavy lifting happens asynchronously. Simple idea, huge difference in how the system *feels*.

More soon.
