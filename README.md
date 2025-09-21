# AWS Vanity Service

A serverless phone number to vanity number conversion service built with AWS Lambda, DynamoDB, and Amazon Connect.

📞 **Try the live demo: 1-833-866-4320**

## 🎯 Project Goals

This project demonstrates a production-ready serverless application that:
- Converts phone numbers into memorable vanity numbers (like 1-800-CALL-NOW)
- Ranks vanity options based on memorability and business value
- Provides real-time voice response through Amazon Connect
- Stores and retrieves vanity numbers efficiently using DynamoDB

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [Development Journal](./docs/development-journal.md) | Daily progress, challenges faced, and solutions implemented |
| [Architecture Decisions](./docs/architecture.md) | Technical choices and trade-offs explained |
| [Deployment Guide](./docs/deployment-guide.md) | Step-by-step setup and deployment instructions |
| [Project Roadmap](./docs/roadmap.md) | Implementation phases and requirements checklist |
| [References & Resources](./docs/references.md) | AWS documentation, tutorials, and resources used |

## 🏗️ Architecture Overview

![AWSVanityService Architecture](./docs/architecture.png)

### Components
- **Amazon Connect**: Handles incoming calls and voice interactions
- **AWS Lambda**: Processes phone numbers and generates vanity alternatives
- **DynamoDB**: Stores the best vanity numbers for quick retrieval
- **AWS CDK**: Infrastructure as Code for reproducible deployments

### Connect Flow Example
![Connect Flow Example](./docs/exampleflow.png)

## ✅ Implementation Status

**Core Features Completed:**
- **Phone Number Processing**: E.164 format support with robust validation
- **Vanity Generation**: 13,248-word English dictionary with AI-assisted optimization
- **High Success Rate**: 90%+ word matches (Example: 555-225-5463 → "555-CALL-463")
- **Production Ready**: PII masking, error handling, comprehensive testing
- **Full TypeScript**: Type safety throughout with modular architecture

**Infrastructure Deployed:**
- **AWS Lambda**: ARM64 architecture with optimized performance
- **DynamoDB**: Caching with 30-day TTL and encryption
- **Amazon Connect**: Live toll-free number with voice integration
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions

*See [Development Journal](./docs/development-journal.md) for implementation details and [Project Roadmap](./docs/roadmap.md) for completion tracking.*

## 📖 What I've Learned

This project has been a deep dive into production-ready serverless development. Key learnings include:

### Technical Skills
- **AWS Lambda Best Practices**: Async/await patterns, proper error handling, PII masking
- **TypeScript in Production**: Interface design, JSON imports, type safety
- **Algorithm Optimization**: O(n) vs O(1) lookups, dictionary pre-processing
- **Production Considerations**: Performance, security, maintainability trade-offs

### Problem-Solving Approach
- **Iterative Development**: Started with simple business dictionary, evolved to comprehensive solution
- **Testing-Driven Decisions**: Built interactive test tools to validate algorithm improvements
- **Performance vs Simplicity**: Chose bundled JSON over external storage for demo simplicity
- **Real-World Thinking**: Implemented PII protection and input validation from the start

### AWS Ecosystem Understanding
- **Lambda Performance**: Cold starts, bundle size optimization, memory considerations
- **Connect Integration**: Event structure, voice response formatting
- **CDK Infrastructure**: TypeScript-based Infrastructure as Code

### Code Quality Insights
- **Documentation Value**: Detailed decision tracking helped explain trade-offs
- **User Experience Focus**: Considered both developer experience and end-user voice interaction

### Connect Integration Lessons
- **Response Format Critical**: Connect requires STRING_MAP - all values must be strings (no arrays/booleans)
- **Manual Setup Required**: Lambda must be explicitly added to Connect instance (not automatic via permissions)
- **Voice Quality**: SSML formatting essential for natural phone number playback

## 🚀 Getting Started

### Prerequisites
- AWS Account with CLI configured
- Node.js 18+ and npm
- GitHub account (for automated deployment)

### Quick Setup

#### 1. Deploy Infrastructure (Automated via GitHub Actions)
```bash
# Fork/clone the repository
git clone https://github.com/WulfTheGod/AWSVanityService.git
cd AWSVanityService

# Set up GitHub OIDC and variables:
# - Configure AWS OIDC identity provider and IAM role
# - Go to Settings → Secrets and variables → Actions → Variables
# - Add AWS_ROLE_ARN only (Connect setup is manual)

# Deploy automatically by pushing to main
git push origin main
# Monitor deployment in GitHub Actions tab
```

#### 2. Set Up Amazon Connect (Manual)
1. **Create Connect Instance** in AWS Console
2. **Add Lambda Function** to Connect (Critical: Go to Flows → AWS Lambda → Add `vanity-generator`)
3. **Create Contact Flow** manually in Connect designer (see deployment guide for details)
4. **Claim toll-free number** and associate with your manually created flow

*Detailed instructions in [Deployment Guide](./docs/deployment-guide.md)*

### Test Your Service
```bash
# Test Lambda directly
aws lambda invoke \
  --function-name vanity-generator \
  --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+15555551234"}}}}' \
  response.json

# Or call the live demo toll-free number: 1-833-866-4320
```

## 🔐 Security Approach

**Demo Configuration:**
- **GitHub OIDC**: Replaced static credentials with temporary role assumption
- **IAM Strategy**: Used `AdministratorAccess` for rapid development (production would use least-privilege)
- **Data Protection**: PII masking in logs, DynamoDB encryption at rest

**Production Recommendations:**
- Least-privilege IAM policies scoped to specific resources
- Separate AWS accounts for different environments
- AWS Config and CloudTrail for compliance monitoring

*Security decisions and production alternatives detailed in [Architecture Decisions](./docs/architecture.md).*

## 📋 Project Structure

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

*Full project structure and architectural decisions in [Architecture Decisions](./docs/architecture.md).*
