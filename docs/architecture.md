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
- **Choice**: DynamoDB single-table design with phone number as partition key
- **Schema**:
  ```
  phoneNumber: "5551234567"         // Partition key
  vanityNumbers: ["555-CALL-NOW"]   // All 5 generated results
  top3: ["555-CALL-NOW"]            // Top 3 for Connect
  createdAt: "2025-09-18T..."
  ttl: 1632847200                   // 30-day auto-deletion
  ```
- **Why**: Simple, efficient caching with automatic cleanup
- **Trade-off**: One record per caller, but perfect for demo requirements

### 3. Modular Code Architecture
- **Choice**: Individual TypeScript files for each function with centralized types
- **Structure**:
  ```
  src/lambda/vanity-generator/
  ├── handler.ts          # Main Lambda entry point
  ├── types.ts            # All interfaces and constants
  ├── clean-phone.ts      # Phone number cleaning logic
  ├── find-words.ts       # Dictionary word matching
  ├── generate-vanity.ts  # Main orchestration logic
  └── [other modules...]
  ```
- **Why**: Better maintainability, easier testing, clear separation of concerns
- **Trade-off**: More files but much cleaner codebase

### 4. Vanity Number Generation
- **Choice**: Dictionary-based scoring system
- **Why**: Produces more meaningful results than random mapping
- **Trade-off**: Requires maintaining a small word list

### 5. Infrastructure as Code
- **Choice**: AWS CDK (TypeScript)
- **Why**: Type safety, reusable constructs, repeatable deployments
- **Trade-off**: Slightly larger deployment package vs raw CloudFormation

### 6. CI/CD Pipeline
- **Choice**: GitHub Actions with automated testing and deployment
- **Flow**: Push → Jest tests → CDK deploy (if tests pass)
- **Why**: Simple, integrated with GitHub, no additional infrastructure needed
- **Trade-off**: GitHub dependency vs self-hosted CI/CD

### 7. Connect Integration Strategy
- **Choice**: Hybrid approach - manual instance setup + CDK flow deployment
- **Why**: Connect instances require manual setup, but flows can be version-controlled
- **Implementation**:
  - Manual: Create instance, claim number, add Lambda permissions
  - Automated: Contact flow deployed via CDK when CONNECT_INSTANCE_ARN is set
- **Trade-off**: Some manual steps vs full automation (which isn't possible with Connect)

## Security
- **IAM**: Lambda roles restricted to DynamoDB + CloudWatch only
- **Connect**: Service-specific permissions for Lambda invocation, scoped to account
- **Data**: DynamoDB encrypted at rest by default
- **Logs**: Caller numbers masked in logs, no sensitive data stored
- **CI/CD**: AWS credentials stored as GitHub secrets, not in code

## Performance Targets
- Lambda execution: Sub-second response time
- DynamoDB query: Minimal latency with single-digit ms goal
- Total call processing: Fast enough for good UX (target <2s)

## Future Improvements
- Retry/DLQ for Lambda failures
- Multi-language SSML support in Connect (English, Spanish, French)
- CloudWatch dashboard + alarms for errors/latency