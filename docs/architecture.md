# Architecture

## Overview
This service uses a simple, serverless architecture on AWS to convert phone numbers into vanity numbers and return them to callers through Amazon Connect.

![AWSVanityService Architecture](./architecture.png)

## Key Decisions

### 1. Serverless First
- **Choice**: AWS Lambda + DynamoDB + Amazon Connect
- **Why**: Cost-effective, automatically scales, no server management
- **Trade-off**: Cold starts (~1s) are acceptable for demo purposes

### 2. Data Model
- **Choice**: DynamoDB single-table design
- **Schema**:
  ```
  PK: PHONE#<phoneNumber>
  SK: VANITY#<timestamp>
  Attributes: vanityNumbers[], scores[]
  ```
- **Why**: Simple, efficient lookups per caller
- **Trade-off**: Less flexible than relational schema, but fine for this use case

### 3. Vanity Number Generation
- **Choice**: Dictionary-based scoring system
- **Why**: Produces more meaningful results than random mapping
- **Trade-off**: Requires maintaining a small word list

### 4. Infrastructure as Code
- **Choice**: AWS CDK (TypeScript)
- **Why**: Type safety, reusable constructs, repeatable deployments
- **Trade-off**: Slightly larger deployment package vs raw CloudFormation

## Security
- IAM: Lambda roles restricted to DynamoDB + CloudWatch only
- Data: DynamoDB encrypted at rest by default
- Logs: Caller numbers masked in logs, no sensitive data stored

## Performance Targets
- Lambda execution: Sub-second response time
- DynamoDB query: Minimal latency with single-digit ms goal
- Total call processing: Fast enough for good UX (target <2s)

## Future Improvements
- Retry/DLQ for Lambda failures
- Multi-language SSML support in Connect (English, Spanish, French)
- CloudWatch dashboard + alarms for errors/latency