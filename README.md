# AWS Vanity Service

A serverless phone number to vanity number conversion service built with AWS Lambda, DynamoDB, and Amazon Connect.

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
| [Project Roadmap](./docs/roadmap.md) | Implementation phases and requirements checklist |
| [References & Resources](./docs/references.md) | AWS documentation, tutorials, and resources used |

## 🏗️ Architecture Overview

![AWSVanityService Architecture](./docs/architecture.png)

### Components
- **Amazon Connect**: Handles incoming calls and voice interactions
- **AWS Lambda**: Processes phone numbers and generates vanity alternatives
- **DynamoDB**: Stores the best vanity numbers for quick retrieval
- **AWS CDK**: Infrastructure as Code for reproducible deployments

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- CDK CLI installed (`npm install -g aws-cdk`)

### Installation
```bash
# Clone the repository
git clone https://github.com/WulfTheGod/AWSVanityService.git
cd AWSVanityService

# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
cdk deploy
