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
- Vanity generation with 13,248-word English dictionary (90%+ success rate)
- DynamoDB caching with 30-day TTL and encryption
- Amazon Connect voice integration with SSML formatting
- TypeScript modules with clean separation
- CI/CD through GitHub Actions with OIDC

*See details: [Roadmap](./docs/roadmap.md) and [Development Journal](./docs/development-journal.md)*

## Dictionary Generation (AI-Assisted)

This project includes a curated English dictionary. I started with **an-array-of-english-words** (~275k words). Then I built a script to reduce it to ~13k words that work well as phonewords.

### Why AI?
I used AI to iterate quickly on filter and scoring rules. I set the guardrails and kept final say. The result is a clean 3–7 letter set. It avoids odd words and triple repeats. Match rates went from under 1% to 90%+ in my tests.

### Why this source?
**an-array-of-english-words** is simple and license-friendly. It gave me the word coverage I needed.

### What the script does
It converts letters to T9 digits once. It scores each word and filters the list. Then it caps the set for Lambda bundle size. The output is `src/data/english-words.json` with precomputed mappings. Lookups are O(1) at runtime.

### DynamoDB plan for production
I'd keep all ~275k words in DynamoDB. Query by digit keys instead of bundling JSON:
- **Table design**: PK `digits`, SK `word`, attrs `length`, `score`, `category`
- **Query pattern**: Generate 3, 4, and 7-digit substrings. Query those keys. Merge and rank in Lambda. Cache top 5.
- **Why better**: No bundle bloat. More matches. Fast queries instead of scans.

> Result: Small demo JSON for now. Clear DynamoDB plan if we need all words later.

## ✅ Verification: Store 5 / Speak 3

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

## How It Works

![AWSVanityService Architecture](./docs/architecture.png)

1. **Caller dials**. Amazon Connect receives.
2. **Lambda processes**. Generates 5 vanity options.
3. **DynamoDB stores**. All 5 saved with 30-day TTL.
4. **Connect speaks**. Top 3 returned to caller.

*Full details: [Architecture Decisions](./docs/architecture.md)*

## Quick Start

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

## Notes for Amazon Connect

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

## Documentation Index

| Document | Purpose |
|----------|---------|
| [Architecture Decisions](./docs/architecture.md) | Technical choices and trade-offs |
| [Development Journal](./docs/development-journal.md) | Progress notes and problem solving |
| [Deployment Guide](./docs/deployment-guide.md) | Step-by-step setup instructions |
| [Project Roadmap](./docs/roadmap.md) | Requirements tracking and completion status |
| [References & Resources](./docs/references.md) | AWS documentation and resources used |

## Data Dictionary

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

## Assignment Q&A

**1) Why I built it this way**
I chose serverless (Lambda + DynamoDB + Connect) to keep costs low. It scales on its own. DynamoDB stores 5 results per caller with TTL. Repeat calls are instant. The hardest part was Amazon Connect. It needs STRING_MAP responses and manual Lambda registration. I kept testing until Connect spoke all 3 results clearly. Then I documented the exact response format and SSML tags.

**2) Shortcuts I took**
I bundled the word list into Lambda for quick delivery. I used broad IAM permissions while building. I kept Connect setup manual because its flow JSON breaks between instances. In production I'd use the DynamoDB plan. I'd lock down IAM to specific resources. I'd automate what I could in Connect.

**3) What I'd do with more time**
- **Monitoring**: CloudWatch metrics, alarms, and dashboard
- **Better scoring**: Multi-word blends, n-gram scoring, industry dictionaries
- **Operations**: Least-privilege IAM, staged environments, drift detection
- **Developer tools**: CLI for test runs, web UI for browsing results

## Project Structure

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

## Security & Production Notes

**Demo Configuration:**
- GitHub OIDC for temporary credentials (no static keys)
- AdministratorAccess for rapid development
- PII masking in logs, DynamoDB encryption at rest

**Production Recommendations:**
- Least-privilege IAM scoped to specific resources
- Separate AWS accounts for environments
- AWS Config and CloudTrail for compliance
- Compress or externalize dictionary to reduce bundle size
- Add CloudWatch alarms for Lambda errors and duration

---

📞 **Try it now: 1-833-866-4320**