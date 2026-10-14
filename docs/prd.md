# ThreadHead — Product Requirements Document

**Status:** Draft  
**Version:** 0.1  
**Product:** ThreadHead  
**Scope:** Opportunity Discovery MVP (English-first)

## 1. Product Summary

ThreadHead helps users find fresh public Threads posts where it makes sense to join the conversation.

The system does not simply search posts by keywords. It:
1. understands what kinds of conversations the user is interested in;
2. generates search queries;
3. retrieves candidates through Threads search;
4. filters and evaluates them;
5. shows the best opportunities;
6. helps prepare a reply;
7. publishes the reply only after explicit user confirmation.

---

## 2. Problem

It is difficult to systematically find relevant Threads conversations where a user or brand can:
- answer a question;
- help solve a problem;
- join a discussion involving their target audience;
- gain additional reach;
- identify potential commercial intent.

A regular keyword search can return posts, but it does not answer the main question:

> Is this conversation worth joining?

---

## 3. MVP Goal

Provide the user with a ranked list of fresh Threads posts where participation may be valuable.

The main MVP flow:

```text
Opportunity Feed
    ↓
Relevant Opportunities
    ↓
Review
    ↓
Generate Reply
    ↓
User Approval
    ↓
Publish Reply
```

---

## 4. Non-Goals

The MVP does not include:
- fully automated replies without user approval;
- mass outreach;
- advanced performance analytics;
- automatic model learning from large-scale feedback;
- full social listening across multiple social networks;
- a guaranteed complete Threads index.

---

## 5. Core Entities

### 5.1 User

```text
User
 ├── Onboarding
 ├── ThreadsAccount[]
 └── OpportunityFeed[]
```

A user can connect multiple Threads accounts and create multiple Opportunity Feeds.

---

### 5.2 Onboarding

Onboarding stores the progress of the initial setup process.

```ts
type Onboarding = {
  id: string
  userId: string
  currentStep: string
  status: string
  draft: Json
  version: number

  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}
```

`draft` is used only for temporarily storing incomplete onboarding data.

After onboarding is completed, the data should be transferred into the appropriate domain entities.

---

### 5.3 ThreadsAccount

A Threads account connected by the user.

```ts
type ThreadsAccount = {
  id: string
  userId: string

  threadsUserId: string
  username: string

  accessTokenEncrypted: string
  tokenExpiresAt: Date
  scopes: string[]

  isActive: boolean

  createdAt: Date
  updatedAt: Date
}
```

Relationship:

```text
User 1 → N ThreadsAccount
```

---

### 5.4 OpportunityFeed

Describes the type of conversations the user wants to find.

```ts
type OpportunityFeed = {
  id: string
  userId: string

  name: string
  intent: string

  includeTerms: string[]
  excludeTerms: string[]
  languages: string[]

  freshnessHours: number
  minScore: number

  isActive: boolean

  createdAt: Date
  updatedAt: Date
}
```

Example:

```text
Name:
Threads Search Problems

Intent:
Find people who complain about Threads search
or are looking for ways to discover relevant conversations.
```

Relationship:

```text
User 1 → N OpportunityFeed
```

---

### 5.5 SearchQuery

A concrete query that ThreadHead uses to search for posts.

SearchQuery is derived from `OpportunityFeed.intent`.

```ts
type SearchQuery = {
  id: string
  opportunityFeedId: string

  query: string
  type: string
  isActive: boolean

  matchedPosts: number
  relevantPosts: number

  createdAt: Date
  updatedAt: Date
}
```

Example:

```text
OpportunityFeed:
"People who struggle to find conversations on Threads"

SearchQueries:
- threads search
- threads keyword search
- find posts on threads
- threads monitoring
```

Relationship:

```text
OpportunityFeed 1 → N SearchQuery
```

---

### 5.6 Opportunity

A post that passed filtering and may be relevant to the user.

```ts
type Opportunity = {
  id: string
  opportunityFeedId: string

  externalPostId: string

  authorUsername: string
  text: string
  permalink: string
  publishedAt: Date

  score: number
  reason?: string

  status:
    | "new"
    | "saved"
    | "dismissed"
    | "replied"

  createdAt: Date
  updatedAt: Date
}
```

A single post can be found by multiple SearchQuery records.

Therefore, a many-to-many relationship is used.

---

### 5.7 OpportunitySearchQuery

```ts
type OpportunitySearchQuery = {
  opportunityId: string
  searchQueryId: string
  createdAt: Date
}
```

Constraint:

```text
unique(opportunityId, searchQueryId)
```

Also:

```text
unique(opportunityFeedId, externalPostId)
```

---

## 6. Onboarding Flow

### Step 1 — Account

The user creates an account.

### Step 2 — Describe Intent

The user answers the question:

> What kinds of conversations do you want to find?

Additional inputs:

- include terms;
- exclude terms;
- freshness.

English is the default and priority language for the MVP.

The data is temporarily stored in:

```text
Onboarding.draft
```

### Step 3 — Create Opportunity Feed

After confirmation, the system creates:

```text
OpportunityFeed
```

### Step 4 — Generate Search Queries

The system generates multiple SearchQuery records from the intent.

### Step 5 — First Search

The first search is executed.

The user immediately receives the first Opportunities.

### Step 6 — Optional Threads Connection

Connecting a Threads account is not required to complete onboarding or use opportunity discovery.

A Threads account is required only for actions that need authenticated account access, such as publishing a reply.

### Step 7 — Complete

```text
Onboarding.status = completed
Onboarding.completedAt = now()
```

---

## 7. Opportunity Discovery Pipeline

```text
OpportunityFeed
      ↓
Generate / update SearchQuery[]
      ↓
Threads keyword_search
      ↓
Normalize
      ↓
Deduplicate
      ↓
Cheap pre-filter
      ↓
LLM relevance evaluation
      ↓
Opportunity scoring
      ↓
Opportunity[]
```

---

## 8. Search

ThreadHead already has access to `threads_keyword_search`.

For each active SearchQuery, the system searches for fresh Threads posts. English is the priority language for the MVP.

Preferred mode:

```text
search_type = RECENT
```

For additional candidates, the system may use:

```text
search_type = TOP
```

Minimum required data:

- post id;
- text;
- username;
- timestamp;
- permalink;
- has_replies;
- is_reply.

---

## 9. Pre-Filter

Before using the LLM, the system should cheaply remove obviously unsuitable records.

Filters:

1. duplicate `externalPostId`;
2. post is too old;
3. wrong language;
4. text is too short;
5. reply instead of root post, if only root posts are needed;
6. already dismissed/replied opportunity;
7. the user's own posts, if necessary.

---

## 10. Opportunity Evaluation

The LLM receives:

```text
OpportunityFeed intent
+
post text
```

Minimum output:

```json
{
  "relevant": true,
  "score": 0.86,
  "reason": "The author is directly asking how to find relevant conversations on Threads."
}
```

Later, the model can be expanded to return:

```json
{
  "topicFit": 0.9,
  "replyWorthiness": 0.8,
  "abilityToAddValue": 0.9,
  "commercialIntent": 0.4,
  "spamRisk": 0.1
}
```

---

## 11. Opportunity Score

MVP score:

```text
OpportunityScore =
    relevance
  × freshness
```

A later version may include:

```text
relevance
freshness
competition
reach
abilityToAddValue
replyWorthiness
```

Engagement should not be the primary factor.

A fresh post with few replies may be more valuable than an already viral discussion.

---

## 12. Opportunity Feed UI

For each Opportunity, display:

- author;
- post text;
- published time;
- likes;
- reposts;
- views;
- top comments/replies;
- score;
- reason;
- matched SearchQuery;
- permalink.

Actions:

```text
Open
Save
Dismiss
Generate Reply
```

---

## 13. Reply Flow

```text
Opportunity
    ↓
Generate Reply Draft
    ↓
User Review
    ↓
Approve
    ↓
Threads API reply_to
    ↓
Opportunity.status = replied
```

Automatic publishing without explicit user confirmation is not allowed in the MVP.

---

## 14. Search Query Quality

For each SearchQuery, store:

```text
matchedPosts
relevantPosts
```

This allows calculating:

```text
precision = relevantPosts / matchedPosts
```

In the future, SearchQuery records with poor precision may be:
- automatically disabled;
- regenerated;
- replaced with new queries.

---

## 15. Functional Requirements

### FR-1

The user can use opportunity discovery without connecting a Threads account.

Connecting a Threads account is optional until the user wants to perform authenticated actions such as publishing a reply.

### FR-2

The user can create multiple Opportunity Feeds.

### FR-3

The system can generate SearchQuery records from Opportunity Feed intent.

### FR-4

An Opportunity Feed can contain multiple active SearchQuery records.

### FR-5

A single Opportunity can be discovered by multiple SearchQuery records.

### FR-6

The system must not create duplicate records for the same Threads post within one Opportunity Feed.

### FR-7

The system must filter candidates before LLM evaluation.

### FR-8

The system must store score and reason for each Opportunity.

### FR-9

The user can dismiss an Opportunity.

### FR-10

The user can generate a reply draft.

### FR-11

A reply is published only after explicit user confirmation.

### FR-12

The system should retrieve and display available engagement metrics for an Opportunity:

- likes;
- reposts;
- views.

### FR-13

The system should retrieve and display top comments/replies for an Opportunity when available.

---

## 16. MVP Success Criteria

The MVP is considered useful if:

1. the user can complete onboarding without connecting a Threads account;
2. at least one Opportunity Feed is created;
3. the system automatically creates SearchQuery records;
4. the system finds fresh English-language Threads posts through `threads_keyword_search`;
5. most displayed Opportunities match the user's intent;
6. each Opportunity shows available likes, reposts, and views;
7. each Opportunity shows top comments/replies when available;
8. irrelevant Opportunities can be dismissed;
9. the same post does not appear more than once in the same Feed;
10. after optionally connecting a Threads account, the user can generate, review, and publish a reply.

---

## 17. Technical Risks / Assumptions

Confirmed:

- application access to `threads_keyword_search`.

The following points must still be validated before or during the MVP:

- availability and reliability of likes, reposts, and views for other users' posts;
- access to and completeness of top comments/replies on other users' posts;
- token refresh lifecycle for connected Threads accounts;
- actual rate limits under production load;
- English search quality;
- completeness of `TOP` and `RECENT` results.

An empty search result must not automatically be interpreted as absence of discussion.

---

## 18. MVP Scope

### Include

- Authentication;
- Onboarding;
- OpportunityFeed CRUD;
- SearchQuery generation;
- `threads_keyword_search`;
- English-first discovery;
- dedupe;
- pre-filter;
- LLM relevance scoring;
- Opportunity list;
- likes, reposts, and views when available;
- top comments/replies when available;
- dismiss/save;
- optional Threads OAuth and ThreadsAccount connection;
- reply draft;
- manual reply publishing for connected accounts.

### Exclude

- watchlist metric polling;
- automatic replies;
- advanced analytics;
- team workspaces;
- browser extension;
- automatic scoring optimization;
- multi-social support.

---

## 19. Entity Relationships

```text
User
 ├── Onboarding
 ├── ThreadsAccount[]
 └── OpportunityFeed[]
       ├── SearchQuery[]
       └── Opportunity[]
              │
              └── OpportunitySearchQuery[]
                       │
                       └── SearchQuery
```

Cardinality:

```text
User 1:N ThreadsAccount
User 1:N OpportunityFeed
User 1:1 Onboarding

OpportunityFeed 1:N SearchQuery
OpportunityFeed 1:N Opportunity

Opportunity N:M SearchQuery
```

---

## 20. Open Product Questions

1. Should users be able to edit SearchQuery records manually?
2. Should SearchQuery records be generated only once or refreshed periodically?
3. At which point should the product prompt the user to connect a ThreadsAccount: when generating a reply, when publishing it, or earlier?
4. Should `saved` be a separate status or a separate bookmark entity?
5. Should dismissed posts be retained only by ID after a certain period?
6. What minimum Opportunity score should be shown to the user?
7. Should `relevant / irrelevant` feedback be included in the MVP?
