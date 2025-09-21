# AWS Vanity Service

📞 **Live demo: 1-833-866-4320**

> Converts phone numbers to vanity numbers. Stores the best **5** and speaks the top **3** through Amazon Connect.

## TL;DR (30 seconds)
- **Stack**: Lambda + DynamoDB + Amazon Connect (serverless, cheap, fast)
- **Exact scope**: Store 5 vanity numbers, speak 3; cached by caller with 30-day TTL
- **Connect gotcha**: Requires STRING_MAP responses and manual Lambda registration

## ✅ Implementation Status

**Core features shipped:**
- Phone number processing with E.164 support
- Vanity generation with 13,248-word English dictionary (high success rate)
- DynamoDB caching with 30-day TTL and encryption
- Amazon Connect voice integration with SSML formatting
- TypeScript modules with clean separation
- CI/CD through GitHub Actions with OIDC

*See details: [Roadmap](./docs/roadmap.md) and [Development Journal](./docs/development-journal.md)*

## Dictionary Generation Process (AI-Assisted)

This project includes a curated English dictionary to generate phonewords. I started with **an-array-of-english-words** (~275k words). At first, the dictionary filtering was only meant as a test, but the results were so strong that it became part of the main system.

### Why AI?

AI was used only to speed up filter and scoring rule iteration during dictionary generation. I set the rules, evaluated results, and kept final say on the final dataset. This allowed me to quickly refine toward a usable 3–7 letter set that avoids odd words and triple repeats. Match rates improved significantly from under 1% to high success rates in testing.

**Note:** AI was never used for infrastructure, Lambda code, or Connect integration — only for dictionary generation due to time constraints.

### Why this source?

**an-array-of-english-words** is simple, free to use, and gave me enough words to test phoneword generation. It worked well for building and testing quickly.

### What the script does

- Converts letters to T9 digits once and stores mappings
- Scores words by length, quality, and memorability
- Filters out problematic words and patterns
- Reduces the set to ~13k words for bundle size and runtime limits

The output is `src/data/english-words.json` with precomputed mappings. Runtime lookups are O(1).

### Runtime Limitation

Using all 275k words in Lambda caused problems with speed and memory. Even though Lambda can run for 15 minutes, processing that many words on every call would be too slow and use too much memory. The smaller 13k word list runs fast and still finds good matches.

### DynamoDB plan for production

For a real production system, I'd put all 275k words in DynamoDB and search by digit patterns. This avoids size limits in Lambda and gives better word matches.

- **Table setup**: Store digits as the main key, words as the sort key, plus word details like length and score
- **How it works**: Search for 3, 4, and 7-digit patterns, combine results, pick the best 5
- **Why better**: More word matches, faster searches, handles more users

### Demo vs. Production

- **Current demo**: 13k words bundled in the code - started as a test but worked so well I kept it
- **Better approach**: Put all 275k words in DynamoDB for more complete results

## ✅ System Verification: Store 5 / Speak 3

The Lambda always **stores 5** vanity numbers in DynamoDB and the Connect flow **speaks 3**.

**Sample DynamoDB item** (sanitized):
```json
{
  "phoneNumber": "5551234567",
  "vanityNumbers": ["555-CALL-NOW","555-SALE-NOW","555-GO-PLUMB","555-NEW-DEAL","555-PRO-HELP"],
  "top3": ["555-CALL-NOW","555-SALE-NOW","555-GO-PLUMB"],
  "createdAt": "2025-09-18T22:09:57.000Z",
  "ttl": 1768773599
}
```

**How to check it yourself:**
- Call the demo number once. The generator runs and stores 5.
- Call again. Results come from cache.
- Check the DynamoDB table. You'll see exactly 5 stored per caller.

> **Why this matters:** It proves the assignment works.

## How the System Works

![AWSVanityService Architecture](./docs/architecture.png)

1. **Caller dials**. Amazon Connect receives.
2. **Lambda processes**. Generates 5 vanity options.
3. **DynamoDB stores**. All 5 saved with 30-day TTL.
4. **Connect speaks**. Top 3 returned to caller.

*Full details: [Architecture Decisions](./docs/architecture.md)*

### Amazon Connect Integration
The service integrates with Amazon Connect through a carefully designed contact flow that handles the complete voice experience:

![Connect Flow Example](./docs/exampleflow.png)

**Flow Process:**
1. **Welcome Message**: Greets caller and explains the service
2. **Lambda Invocation**: Calls vanity generator with caller's phone number
3. **Response Validation**: Checks if vanity numbers were successfully generated
4. **Voice Playback**: Uses SSML to clearly speak the top 3 vanity options
5. **Call Completion**: Thanks caller and ends the call

## Quick Start Guide

### Prerequisites
- AWS Account with CLI configured
- Node.js 18+ and npm
- GitHub account for CI/CD

### Deploy (Automated via GitHub Actions)
```bash
# Fork/clone the repository
git clone https://github.com/WulfTheGod/AWSVanityService.git
cd AWSVanityService

# Configure GitHub OIDC (see Deployment Guide for details)
# Add AWS_ROLE_ARN to GitHub repository variables

# Deploy automatically
git push origin main
```

### Manual Connect Setup (Required)
1. Create Connect Instance in AWS Console
2. **Add Lambda Function** to Connect (Critical: Flows → AWS Lambda → Add `vanity-generator`)
3. Create Contact Flow manually in designer
4. Claim toll-free number and associate with flow

*Full instructions: [Deployment Guide](./docs/deployment-guide.md)*

## Amazon Connect Configuration

### Response Format (Critical)
Connect requires **STRING_MAP** format. All values must be strings:
```javascript
return {
    success: "true",           // Not boolean true
    top3_0: "555-CALL-NOW",    // Individual keys
    top3_1: "555-SALE-NOW",    // Not an array
    top3_2: "555-GO-PLUMB",
    cached: "false"
};
```

### Manual Lambda Registration
You must add Lambda to your Connect instance. IAM permissions alone aren't enough.
Go to: Connect Console → Contact Flows → AWS Lambda → Add your function

## Documentation Reference

| Document | Purpose |
|----------|---------|
| [Architecture Decisions](./docs/architecture.md) | Technical choices and trade-offs |
| [Development Journal](./docs/development-journal.md) | Progress notes and problem solving |
| [Deployment Guide](./docs/deployment-guide.md) | Step-by-step setup instructions |
| [Project Roadmap](./docs/roadmap.md) | Requirements tracking and completion status |
| [References & Resources](./docs/references.md) | AWS documentation and resources used |

## Data Schema Reference

**DynamoDB Schema:**
```typescript
{
  phoneNumber: string,      // Partition key: cleaned phone (e.g., "5551234567")
  vanityNumbers: string[5], // All 5 generated vanity numbers
  top3: string[3],         // Top 3 for Connect voice response
  createdAt: string,       // ISO timestamp
  ttl: number             // Unix timestamp for 30-day auto-deletion
}
```

## Project Design Decisions

### Why I built it this way

**Serverless fits the requirements.** Lambda + DynamoDB + Amazon Connect keeps costs low and scales automatically. The 30-day TTL in DynamoDB makes the "store 5, speak 3" pattern simple to implement.

**Connect constraints shaped the architecture.** Amazon Connect requires STRING_MAP responses (flat key-value pairs with all string values) and manual Lambda registration in the console. I restructured the Lambda response to use individual string fields (`top3_0`, `top3_1`, `top3_2`) instead of arrays.

**Performance over perfection.** A pre-filtered 13k word dictionary with T9 mappings gives fast results within Lambda's deployment limits. The original plan was DynamoDB storage, but bundling proved simpler for the demo timeline.

**Struggles I solved:** Connect failed silently on array responses until I discovered the STRING_MAP requirement; fixed Jest test hangs caused by 0/1 digits triggering infinite loops; resolved CDK bundling conflicts with AWS SDK.

### Shortcuts I took

**Bundled dictionary in Lambda code.** The 1.4MB JSON file deploys quickly but requires redeployment for updates. Production should use DynamoDB with the full 275k word dataset and query by digit patterns.

**Broad IAM permissions.** Used AdministratorAccess during development for speed. Production needs least-privilege policies scoped to specific DynamoDB tables and Lambda functions.

**Manual Connect setup.** Contact flow JSON contains instance-specific UUIDs that break portability, so I documented manual steps. Better automation would require programmatic flow creation APIs.

**AI for dictionary filtering only.** Used AI to iterate quickly on word filtering rules due to time constraints. All Lambda code, infrastructure, and Connect integration were built manually.

### What I would do with more time

**Use the full word database.** Load all 275k words from an-array-of-english-words into DynamoDB instead of the current 13k subset. This would give better results and more chances for unique vanity numbers.

**Add monitoring.** Set up alerts for errors and slow responses so I know when something breaks.

**Better word matching.** Try combining multiple words or use business-specific dictionaries to make more relevant vanity numbers.

**Create better error handling.** If the Lambda fails during a call, redirect to a human customer service line, put callers in a queue with hold music, or add an interactive game to keep them busy while waiting.

## Codebase Structure

```
├── src/lambda/vanity-generator/  # Modular TypeScript Lambda
│   ├── handler.ts               # Main entry point
│   ├── types.ts                 # Centralized type definitions
│   └── [8 other modules]        # Clean separation of concerns
├── tests/                       # Jest TypeScript test suite
├── scripts/                     # Dictionary generation utilities
├── docs/                        # Comprehensive documentation
└── .github/workflows/           # CI/CD automation
```

## Security & Production Considerations

**Demo Configuration:**
- GitHub OIDC for temporary credentials (no static keys)
- AdministratorAccess for rapid development
- PII masking in logs - phone numbers are not stored in plaintext logs
- DynamoDB encryption at rest

**Production Recommendations:**
- Least-privilege IAM scoped to specific resources
- Separate AWS accounts for environments
- AWS Config and CloudTrail for compliance
- Compress or externalize dictionary to reduce bundle size
- Add CloudWatch alarms for Lambda errors and duration

---

📞 **Try it now: 1-833-866-4320**