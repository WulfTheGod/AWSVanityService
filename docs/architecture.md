# Architecture Decisions

## Overview

This service uses serverless AWS to convert phone numbers into vanity numbers. It returns them to callers through Amazon Connect.

![AWSVanityService Architecture](./architecture.png)

## 🎯 What Changed My Mind

**Connect's STRING_MAP constraint** forced me to redesign the response. I tried arrays and booleans first. Connect silently failed. CloudWatch showed me Connect needs all values as strings with flat keys. This shaped the entire Lambda response.

**Dictionary bundling vs external storage** was another pivot. I started with S3 for the word list. The added latency wasn't worth it for a 1.4MB file. Bundling directly made deployment simpler and cold starts faster.

## 💰 Cost & Performance

> **Cold start:** ~1s acceptable for demo
> **Architecture:** ARM64 for ~20% better price/performance
> **Storage:** DynamoDB TTL keeps costs bounded (30-day auto-cleanup)
> **Bundle size:** 1.4MB including dictionary (under Lambda's 3MB limit)

## Key Decisions

### 1. **Serverless First** → Lambda + DynamoDB + Connect
- **Why:** No servers to manage. Scales automatically. Pay only for what you use.
- **Trade-off:** Cold starts happen but are fine for voice calls
- [Details in Dev Journal: Day 1](./development-journal.md#day-1)

### 2. **DynamoDB Single Table** → Phone number as partition key
- **Why:** Simple lookups. TTL cleans up old data. Built-in encryption.
- **Trade-off:** One record per caller. No history. Perfect for this assignment.
- [Details in Dev Journal: Day 2](./development-journal.md#day-2)

### 3. **Modular TypeScript** → 10 focused modules with centralized types
- **Why:** Easy to maintain. Easy to test. Each module does one thing.
- **Trade-off:** More files but much cleaner than one big handler
- [Details in Dev Journal: Day 3](./development-journal.md#day-3)

### 4. **Dictionary-Based Scoring** → 13,248 English words with categories
- **Why:** Makes meaningful vanity numbers instead of random letters
- **Trade-off:** Adds 1.4MB to bundle but huge quality boost
- **Strategy:** Precomputed T9 mappings on curated set. Production would keep full ~275k in DynamoDB with digit-keyed queries. See [Dictionary Generation](../README.md#dictionary-generation-ai-assisted).
- [Details in Dev Journal: Day 4](./development-journal.md#day-4)

### 5. **CDK in TypeScript** → Infrastructure as Code
- **Why:** Type safety. Version control. Same deployment every time.
- **Trade-off:** Takes time to learn but worth it

## Data Model

**DynamoDB Schema:**
```json
{
  "phoneNumber": "5551234567",         // Partition key
  "vanityNumbers": ["555-CALL-NOW"],   // All 5 generated results
  "top3": ["555-CALL-NOW"],            // Top 3 for Connect
  "createdAt": "2025-09-18T...",
  "ttl": 1632847200                    // 30-day auto-deletion
}
```

**Lambda Response (Connect STRING_MAP):**
```json
{
  "success": "true",
  "top3_0": "555-CALL-NOW",
  "top3_1": "555-SALE-NOW",
  "top3_2": "555-GO-PLUMB",
  "cached": "false"
}
```

## Module Structure

```
src/lambda/vanity-generator/
├── handler.ts          # Entry point
├── types.ts            # All interfaces and constants
├── clean-phone.ts      # Input validation
├── find-words.ts       # Dictionary matching
├── generate-vanity.ts  # Core algorithm
├── format-vanity.ts    # Output formatting
├── mask-phone.ts       # PII protection
├── random-letters.ts   # Fallback generation
├── get-data.ts         # DynamoDB reads
└── save-data.ts        # DynamoDB writes
```

Each module does one thing. The handler coordinates while business logic stays separate.

## Production Considerations

### Current (Demo) Setup
- **IAM:** AdministratorAccess for rapid iteration
- **Dictionary:** Bundled in Lambda for simplicity
- **Connect:** Manual configuration (flow designer)
- **Monitoring:** CloudWatch Logs only

### Production Recommendations

**Security:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:PutItem"],
    "Resource": "arn:aws:dynamodb:*:*:table/VanityNumbersTable"
  }]
}
```

**Monitoring:**
- CloudWatch Alarms: Lambda errors > 0 over 5min, P95 duration > 2s
- Custom metrics: Cache hit rate, word match rate, fallback usage
- Performance monitoring for end-to-end response times

**Optimization:**
- Dictionary compression or move to Lambda Layer
- Multi-region DynamoDB Global Tables for availability
- Reserved concurrency to prevent throttling

## Connect Integration Gotchas

1. **Lambda must be manually registered** in Connect instance (not just IAM)
2. **Response must be STRING_MAP** - no arrays, no booleans
3. **SSML formatting required** for natural phone number speech
4. **Contact flow JSON** contains UUIDs that break between instances

These constraints shaped my design choices. They're why Connect setup stays partly manual.

## Why These Choices Work

I chose **demonstration clarity** over production complexity. The assignment asked for a working service that stores 5 and speaks 3. This architecture delivers that.

The modular structure makes code easy to understand. The serverless approach keeps costs near zero when idle. The documentation shows what I built and what I'd change for production.

Most important: it works. Callers get memorable vanity numbers in seconds.