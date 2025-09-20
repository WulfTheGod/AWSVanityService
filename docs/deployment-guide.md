# Deployment Guide

## Overview
This project uses GitHub Actions to automatically test and deploy to AWS when you push code to the main branch.

## Initial Setup

### 1. Fork/Clone the Repository
```bash
git clone https://github.com/WulfTheGod/AWSVanityService.git
cd AWSVanityService
```

### 2. Configure AWS CLI Locally
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output: json
```

### 3. Bootstrap CDK (One-Time Setup)

CDK requires a one-time bootstrap per AWS account/region combination. This creates the necessary S3 buckets and IAM roles for CDK deployments.

**Verify your account and bootstrap:**
```bash
# Verify you're in the correct AWS account
aws sts get-caller-identity --profile <PROFILE_NAME>

# Install CDK globally
npm install -g aws-cdk

# Bootstrap the account/region (only needed once)
npx cdk bootstrap aws://ACCOUNT_ID/REGION --profile <PROFILE_NAME>
```

**Note:** Bootstrap only needs to be done once per account/region, either locally or automatically in CI with the GitHub OIDC role.

## GitHub OIDC Setup

### 1. Create AWS Identity Provider
1. In AWS Console, go to **IAM → Identity Providers → Add provider**
2. Configure provider:
   - **Provider type**: OpenID Connect
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
3. Click **Add provider**

### 2. Create IAM Role for GitHub Actions
1. Go to **IAM → Roles → Create role**
2. **Trusted entity type**: Web identity
3. **Identity provider**: `token.actions.githubusercontent.com`
4. **Audience**: `sts.amazonaws.com`
5. **GitHub organization**: `your-github-username`
6. **GitHub repository**: `your-repo-name`
7. **GitHub branch**: `main`

### 3. Attach Permissions to Role
**For Demo Purposes:**
- Attach **AdministratorAccess** policy for simplicity

**For Production:**
- Create custom policy with only required permissions:
  - `cloudformation:*`
  - `lambda:*`
  - `dynamodb:*`
  - `connect:*`
  - `iam:PassRole`, `iam:CreateRole`, `iam:AttachRolePolicy`
  - `logs:*`

### 4. Get Role ARN
1. AWS Console → **IAM → Roles** → select your GitHub role
2. **Copy Role ARN** from the role Summary

### 5. Add GitHub Repository Variables
1. GitHub → **Settings → Secrets and variables → Actions → Variables** → **New repository variable**:
   - `AWS_ROLE_ARN` = your role ARN (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)
   - `CONNECT_INSTANCE_ARN` = your Connect Instance ARN (from Connect → instance Overview)

**Where to find the Connect Instance ARN:**
Amazon Connect console → click your instance → Overview → Instance ARN (under Distribution settings)

### Security & IAM Decisions (Demo)
Role uses `AdministratorAccess` for simplicity. In production, scope to the services used (CloudFormation, Lambda, DynamoDB, Connect).

### 6. How GitHub Actions Works
When you push code to the main branch:
1. GitHub Actions assumes the AWS IAM role using OIDC (no stored credentials)
2. Runs the tests (`npm test`)
3. If tests pass, deploys to AWS using CDK with the assumed role
4. You can watch the progress in the Actions tab on GitHub

**Security Benefits:**
- No long-lived AWS credentials stored in GitHub
- Role assumption scoped to specific repository and branch
- Temporary credentials with automatic rotation

### Quick Sanity Checks
- **IAM role trust restriction** shows `repo:your-username/your-repo-name:ref:refs/heads/main`
- **Workflow uses OIDC**: `aws-actions/configure-aws-credentials@v4` with `role-to-assume: ${{ vars.AWS_ROLE_ARN }}`
- **Region set to** `us-east-1`
- **CONNECT_INSTANCE_ARN variable** is set and matches the region of the stack/Lambda
- **flow.json uses a real Lambda ARN** (not just the function name)
- **In Connect console** you've added the Lambda under Flows → AWS Lambda so it appears in the flow editor

### 3. Deploy Your Code
```bash
git add .
git commit -m "Deploy vanity service"
git push origin main
```

Then check the Actions tab in GitHub to see the deployment progress.

## Manual Deployment (Alternative)

If you prefer to deploy manually instead of using GitHub Actions:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Deploy to AWS
cdk deploy
```

## Amazon Connect Setup

After the initial CDK deployment completes:

### 1. Create Connect Instance (Manual - CDK Cannot Automate)
1. Go to Amazon Connect Console in AWS
2. Click "Add an instance"
3. For Identity management, choose "Store users within Amazon Connect"
4. Set Access URL (must be globally unique): `vanity-service-demo`
5. Create Administrator account (save these credentials)
6. On Telephony page, enable both inbound and outbound calls
7. On Data storage page, accept defaults
8. Click "Create instance"
9. **Copy the Instance ARN**: Go to the Amazon Connect console, click on your instance, and copy the Instance ARN shown on the Overview page (format: `arn:aws:connect:region:account:instance/instance-id`)

### 2. Add Lambda Function to Connect (Manual - CDK Cannot Automate)
1. Still in AWS Console, go to your Connect instance
2. On the left navigation, go to "Flows" (near bottom)
3. Scroll down to "AWS Lambda" section
4. Select your Lambda function: `vanity-generator`
5. Click "Add Lambda Function"

**Critical**: This step makes the Lambda appear in the Contact Flow editor and sets up invoke permissions. Without this step, the contact flow will fail even though CDK creates the flow - Connect must be explicitly told which Lambda functions it can use.

6. **Verify**: Check Lambda console → Functions → vanity-generator → Permissions tab to see Connect invoke permission

### 3. Deploy Contact Flow via CDK (Automated)
1. Set the Connect Instance ARN as an environment variable:
   ```bash
   export CONNECT_INSTANCE_ARN=arn:aws:connect:us-east-1:123456789012:instance/your-instance-id
   ```
2. Redeploy CDK to create the contact flow:
   ```bash
   cdk deploy
   ```
   **Note**: CDK updates the existing flow in place and automatically injects the correct Lambda ARN. No duplicates are created unless you change the logical ID or add a second flow resource.

### 4. Access Connect Admin Dashboard
1. Click on your instance name in AWS Console
2. Click the "Access URL" link (opens Connect admin dashboard)
3. Login with the admin credentials you created

### 5. Claim Phone Number and Associate Flow (Manual - CDK Cannot Automate)
1. In Connect admin dashboard, go to Channels → Phone numbers
2. Click "Claim a number"
3. Select:
   - Type: Voice
   - Country: United States
   - Type: Toll free
4. Choose a number from the list
5. For "Contact flow", select "VanityNumberFlow" (created by CDK)
6. Click "Save"

## Testing the Deployed Lambda

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

To remove all AWS resources and avoid charges:

```bash
cdk destroy
```

## Troubleshooting

### Common Issues

**Wrong ARN vs ID Format**
- Use full ARN: `arn:aws:connect:us-east-1:123456789012:instance/abc123-def456`
- Not just ID: `abc123-def456`

**Region Mismatch**
- Ensure GitHub Actions workflow region matches your CDK stack region
- Connect instance must be in same region as Lambda function

**Missing Lambda Permission**
- Check Lambda console → Functions → vanity-generator → Permissions tab
- Should see policy allowing `connect.amazonaws.com` to invoke function
- If missing, re-add Lambda in Connect console under Flows → AWS Lambda

**Contact Flow Not Visible**
- Flow may not appear if CDK logical ID changed between deployments
- Check CloudFormation stack for `VanityContactFlow` resource
- Redeploy with same logical ID to update existing flow

**GitHub Actions Failing**
- Verify GitHub variables are set: `AWS_ROLE_ARN`, `AWS_REGION`, `CONNECT_INSTANCE_ARN`
- Check Actions tab for specific error messages
- Ensure IAM role has sufficient permissions (CloudFormation, Lambda, DynamoDB, Connect)
- Verify OIDC trust relationship includes your GitHub repository and branch

**CDK Bootstrap Required**
If you see "SSM parameter /cdk-bootstrap/... not found" or "This stack uses assets" error:
```bash
# Bootstrap is required - run the bootstrap command from section 3 above
npx cdk bootstrap aws://ACCOUNT_ID/REGION --profile <PROFILE_NAME>
```

## Cost Information

**Detailed Cost Breakdown:**
- **Lambda**: Free tier (1M requests/month), then $0.0000002 per request
- **DynamoDB**: Free tier (25 GB storage), then $0.25/GB/month
- **CloudWatch**: Free tier (5 GB logs), then $0.50/GB/month
- **Amazon Connect**: ~$0.06/day for toll-free number + $0.022/minute for usage
- **Total Demo Cost**: $2-5/month depending on usage

**Important**: Toll-free numbers incur daily charges even when not used. DynamoDB and Lambda may exceed free tier if heavily used during development.

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

**Important Notes**:
- CDK destroys the DynamoDB table and **all stored vanity number data will be permanently lost**
- You must manually release the phone number and delete the Connect instance as CDK cannot automate these cleanup steps