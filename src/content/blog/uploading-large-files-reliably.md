---
title: 'Uploading Large Files Reliably: Chunking, Resumable Uploads, and Block Servers'
date: '2026-09-21'
excerpt: 'How production systems like Google Drive and Dropbox handle multi-gigabyte uploads over unreliable connections.'
tags: ['system-design', 'backend', 'file-storage']
sourceWikiPage: 'Google Drive System Design'
---

A single PUT request works fine for a 500KB profile picture. It falls apart for a 2GB video file on a mobile connection that drops every few minutes. The difference is not bandwidth, it is failure handling: a naive upload that fails at 95% has to restart from zero, and at scale that wastes bandwidth, server time, and user patience on every retry. The pattern used by Google Drive, Dropbox, and similar systems solves this with three ideas: split the file into blocks, upload it in a resumable way, and only re-send what actually changed.

## Splitting the file into blocks

Instead of treating a file as one blob, the client splits it into fixed-size chunks (Dropbox uses a 4MB block size as its reference point) before anything gets sent. Each block moves through the same three-step pipeline: compress it, encrypt it, then upload it. Compression algorithm choice depends on content type, text compresses well with something like gzip, while images and video need a different approach or none at all.

This block-level view is what makes the rest of the design possible. Once a file exists as a sequence of independently addressable chunks, you get resumability, partial re-sync, and deduplication almost for free.

## Resumable upload as a first-class API

A resumable upload is a distinct API shape from a simple upload, built for large files or unstable connections. It works in three steps:

```
function resumable_upload(file):
    session = request_upload_session(file.metadata)
    for block in split_into_blocks(file):
        send_block(session, block)
        record_progress(session, block.index)
        # connection may drop here; resume_upload() picks up
        # from the last recorded block.index on reconnect
    finalize(session)
```

The key property is that progress is tracked per block, not per file. If the connection drops after block 40 of 100, the client does not restart the transfer, it asks the server which blocks it already has and resumes from there. For a large file on a flaky network, this is the difference between an upload that eventually completes and one that never does.

## Delta sync: only send what changed

The same block structure pays off again once a file is edited and needs to sync again. Delta sync compares the current set of blocks against the previous version and only re-uploads the blocks that changed. A 10-block file where only blocks 2 and 5 were modified means 2 blocks travel over the network, not 10. For anyone on a mobile data plan, or for a service absorbing the bandwidth cost of millions of small edits, this is a meaningful reduction rather than a minor optimization.

## Where the logic should live

There is a tempting shortcut: skip the intermediate server and have the client upload straight to cloud storage (S3 or equivalent). It is faster in the simple case since it removes a network hop, but it comes with two real costs. First, chunking, compression, and encryption logic has to be implemented and maintained separately for every client platform, iOS, Android, and web, instead of once, centrally. Second, and more important, client-side apps can be modified or reverse-engineered, so encryption logic running on the client is not a safe place to enforce security guarantees. Centralizing the block pipeline in a server component costs a bit of latency but keeps the enforcement point somewhere the client cannot tamper with.

## Storage savings come from the same design

Once files are stored as content-addressed blocks, block-level deduplication is a natural extension: two blocks with the same hash across an account are only stored once, regardless of which files reference them. Combined with a backup policy that caps how many old versions are retained and moves infrequently accessed data to cheaper cold storage, the same chunking decision that made uploads resumable also becomes the mechanism that keeps storage costs under control.

## Why this matters beyond file storage

For a product handling user-generated media, documents, or backups, upload reliability is directly a support cost and a churn risk. A failed multi-gigabyte upload that has to restart from scratch is the kind of friction that gets a support ticket, or gets abandoned entirely. The engineering cost of building resumable, chunked uploads is front-loaded, but it converts unreliable networks from a product-breaking problem into an expected, handled case. That tradeoff is usually worth making before the volume of large-file uploads gets large enough to make it painful.
