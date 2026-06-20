---
title: "Off the Bull(MQ), Onto Temporal"
date: "2025-06-28"
subtitle: "and what we learned along the way"
slug: "off-the-bullmq-onto-temporal"
---

> When we started out, [Bull](https://github.com/OptimalBits/bull) was our go-to solution for job queues. It was simple, reliable enough, and gave us the ability to offload things like sending emails and syncing data into background jobs. But as our system matured, those background tasks started getting more complex: some needed retries, others spanned days, and several required human approvals or needed to coordinate with other services.
> 
> It was becoming clear that we weren't just queueing jobs anymore—we were building **distributed workflows**, and our job queue wasn't built for that. So we migrated to [Temporal](https://temporal.io/), and in this post, I’ll explain why.

## **What Is Temporal?**

> Temporal is a **durable workflow orchestration engine**. It’s not just a job queue; it’s a system that lets you model business logic as workflows with guaranteed execution. A workflow in Temporal can run for minutes, days, or even months and survive restarts, crashes, and failures along the way.
> 
> You might have heard of [Apache Airflow](https://airflow.apache.org/), another popular workflow orchestrator. While Airflow is great for **batch-oriented data pipelines** (think ETL jobs and DAG-based scheduling), Temporal is designed for **event-driven, long-running, and highly concurrent workflows**. Temporal supports native retry, fault-tolerance, and stateful coordination across distributed services. Where Airflow often relies on external scripts and polling, Temporal gives you full control flow with real code and persistent state—think of it as writing workflows as if they were normal async functions, but with crash recovery and observability built in.
> 
> It works by decoupling two pieces:

-   **Workflow code**: Defines the high-level orchestration logic.
    
-   **Activities**: The individual, side-effectful tasks (e.g., send an email, charge a card).
    

> Every step of a workflow is **durably persisted** via event sourcing. When a workflow runs, Temporal records every event (like an activity starting or completing) in a persistent store (e.g. Cassandra or MySQL/Postgres). If the worker crashes or restarts, Temporal replays the event history to reconstruct the workflow state and continue execution deterministically. This is key to its reliability: your workflow code is treated like a pure function, replayed with the same inputs to restore memory and continue from the last unprocessed event.

## **What Our Implementation Looked Like**

> We started by migrating a few critical workflows from Bull to Temporal. The whole transition took only **one month**, including internal tooling and infrastructure work.
> 
> We introduced a hybrid architecture where Temporal handled core orchestration, and we used an **outbox pattern** to integrate with existing systems. Here's how it worked:

-   We stored domain events in **DynamoDB** as an outbox table.
    
-   Temporal **workflows** monitored these tables and launched **Activities** in response to relevant events.
    
-   Processed events were exported in batch to **S3** for downstream analytics and archival.
    

> This architecture gave us strong durability guarantees without disrupting the rest of our stack. Using DynamoDB allowed us to scale ingestion independently, and Temporal gave us workflow resilience, retries, and long-running coordination.
> 
> We also created specialized **worker services** for different types of workflows: user onboarding, billing, email sequences, and background syncs. Each worker pulled from its own task queue, and we leveraged Temporal’s type-safe TypeScript SDK to keep our workflow logic clean and maintainable.

## **Why We Switched from Bull**

Bull is fantastic for straightforward job queueing. But here are the things we ran into that made us switch:

### **1\. Retries and Failure Recovery**

In Bull, if a job fails, you configure retries manually. You have to worry about what happens when the job crashes halfway through, and often, you'll need custom logic to track which steps completed.

### **2\. Long-Running and Paused Workflows**

In Bull, long-running jobs are risky - Redis locks might expire, or workers might get killed. Want to wait 24 hours before retrying a job? Good luck.

### **3\. Human-in-the-Loop Steps**

We had use cases like onboarding workflows that paused until someone uploaded a document or approved a payment. In Bull, that meant chaining jobs and managing state externally (in a DB).

### **4\. Distributed and Scalable Workers**

Bull is tied to Redis and Node.js. You can scale horizontally, but everything has to live in the same ecosystem.

## **Drawbacks and Trade-offs**

Temporal isn’t free. You have to run a Temporal server (or pay for Temporal Cloud). Your workflow code must be

## **Final Thoughts**

Bull served us well. But it started to feel like duct tape holding together an increasingly complex state machine. Temporal gave us structure, visibility, and peace of mind.

## **If You Want to Learn More**

-   [Temporal Documentation](https://docs.temporal.io/)
    
-   [Temporal TypeScript SDK](https://docs.temporal.io/typescript/introduction)
    
-   [Temporal YouTube Channel](https://www.youtube.com/c/temporalio)
