# Deployment Guide

## Quick Start

### Prerequisites
- AWS Account with CLI configured
- Node.js 18+ and npm
- GitHub account for CI/CD

### 1. Setup Project
```bash
git clone https://github.com/WulfTheGod/AWSVanityService.git
cd AWSVanityService
npm install
```

### 2. Bootstrap CDK (One-Time)
```bash
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

### 3. GitHub Actions Setup

**AWS Setup:**
1. IAM → Identity Providers → Add provider
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. IAM → Roles → Create role
   - Trust: Web identity → token.actions.githubusercontent.com
   - Condition: `repo:your-username/your-repo:ref:refs/heads/main`
   - Permission: `AdministratorAccess` (demo only)
   - Copy the Role ARN

**GitHub Setup:**
1. Settings → Secrets → Actions → Variables
2. Add `AWS_ROLE_ARN` = your role ARN

**Deploy:**
```bash
git push origin main  # Triggers automatic deployment
```

### 4. Manual Deployment (Alternative)
```bash
npm install
npm test
npx cdk deploy
```

## Amazon Connect Setup

> **What's automated vs manual:** CDK automatically sets up Lambda, DynamoDB, and permissions. Amazon Connect requires manual steps: claim a phone number, add Lambda to the instance, and create the flow. Connect flows have unique IDs that don't work between different instances, so I document the exact manual steps.

### 1. Create Instance
Amazon Connect Console → Add instance → Store users in Connect → Create

### 2. Add Lambda (CRITICAL)
Your instance → Flows → AWS Lambda → Add `vanity-generator`
> Without this step, calls will fail

### 3. Build Contact Flow
Create flow with these blocks:
1. **Play prompt** → Welcome message
2. **Invoke AWS Lambda** → `vanity-generator` (8 sec timeout)
3. **Check contact attributes** → External `success` equals `true`
4. **Play prompt** → Success: `$.External.top3_0, $.External.top3_1, $.External.top3_2`
5. **Disconnect**

![Connect Flow Example](./exampleflow.png)

### 4. Claim Phone Number
Channels → Phone numbers → Claim → Toll free → Associate with flow

## Testing the Deployed Lambda

> **Note:** The English dictionary JSON is prebuilt and committed. No runtime downloads needed. Production would query DynamoDB instead.

After deployment completes:

```bash
# Test the Lambda function
aws lambda invoke \
  --function-name vanity-generator \
  --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+15555551234"}}}}' \
  response.json

# View the response
cat response.json
```

## Monitoring

### View Lambda Logs
```bash
aws logs tail /aws/lambda/vanity-generator --follow
```

### Check DynamoDB Table
```bash
aws dynamodb scan --table-name VanityNumbersTable
```

## Clean Up Resources

To remove all AWS resources:

```bash
cdk destroy
```

## Troubleshooting

### Common Issues

**"Lambda Function Returned An Error"**
- Cause: Lambda not added to Connect instance
- Fix: Flows → AWS Lambda → Add function

**Lambda Response Format**
- Connect needs STRING_MAP (all strings)
- Wrong: `{top3: ["970-GOAL-226"], cached: true}`
- Right: `{top3_0: "970-GOAL-226", success: "true"}`

**CDK Bootstrap Error**
```bash
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

## 💰 Cost Information

**Monthly Demo Costs:**
- **Amazon Connect**: ~$2/month (toll-free number)
- **Lambda + DynamoDB**: Usually free tier
- **CloudWatch**: Usually free tier
- **Total**: $2-5/month

⚠️ **Important**: Toll-free numbers cost money daily even when unused.

## Cleanup Instructions

**To avoid ongoing charges:**

1. **Release Phone Number** (Manual - Most Important)
   ```
   Connect Admin Dashboard → Channels → Phone numbers → Select number → Release
   ```

2. **Delete Connect Instance** (Manual)
   ```
   AWS Console → Amazon Connect → Select instance → Delete
   ```

3. **Destroy CDK Stack** (Automated)
   ```bash
   cdk destroy
   # Removes Lambda, DynamoDB table (DATA LOST), Contact Flow, IAM roles
   ```

**Important Notes:**
- CDK destroys the DynamoDB table. **All data will be lost.**
- You must manually release the phone number and delete the Connect instance. CDK can't automate these steps.