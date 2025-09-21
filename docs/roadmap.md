# Project Roadmap

**Goal**: Working vanity number service with live toll-free number demo

## Project Requirements (From Assignment)
- ✅ Lambda converts phone numbers to vanity numbers
- ✅ **Save the BEST 5 vanity numbers** to DynamoDB table
- ✅ **Return TOP 3 vanity numbers** for Connect integration
- ✅ Connect contact flow **says the TOP 3** vanity possibilities (manual flow setup)
- ✅ Live Amazon Connect phone number for testing (manual setup required)
- ✅ Git repo with all code and documentation

## Phase 1: Core Lambda Implementation ✅

### Vanity Generator Lambda (Modular Architecture)
- ✅ **Modular Design**: Split into 10 focused TypeScript modules
- ✅ **Type Safety**: All interfaces and constants in types.ts
- ✅ Clean phone number input (remove non-digits)
- ✅ Phone keypad mapping (2=ABC, 3=DEF, etc.)
- ✅ English word dictionary (13,248 words with scores)
- ✅ Scoring algorithm to rank vanity combinations
- ✅ **Generate and score vanity number combinations**
- ✅ **Select BEST 5 vanity numbers based on scoring**
- ✅ **Fallback strategy** (random letters when no words match)
- ✅ **Production features**: PII masking, input validation, error handling
- ✅ **Save all 5 results to DynamoDB with caller's number**
- ✅ **Built-in caching**: Check existing records before generation
- ✅ **Return TOP 3** for Connect voice integration

### Testing Requirements Met
- ✅ **Jest TypeScript Testing**: Test suite with type checking
- ✅ **Algorithm Testing**: 90%+ success rate with English dictionary
- ✅ **Interactive Testing**: Test tool shows word matching
- ✅ **Production Testing**: PII masking, validation, error handling work
- ✅ Verify exactly 5 numbers saved to DynamoDB
- ✅ Confirm top 3 are returned to Connect
- [ ] Test with multiple caller numbers

## Phase 2: AWS Infrastructure

### CDK Deployment
- ✅ DynamoDB table schema (phone number + 5 vanity results)
- ✅ Lambda function with DynamoDB permissions
- ✅ Environment variables (table name, LOG_LEVEL)
- ✅ Lambda settings (30 seconds, ARM64, structured logging)
- ✅ AWS SDK v3 bundling fix
- ✅ Connect IAM permissions for Lambda
- ✅ Connect permissions for Lambda calls
- ✅ Document manual flow creation
- ✅ Deploy to AWS and test 5-store/3-return works

### Data Validation
- ✅ Caching strategy with exactly 5 vanity numbers per caller
- ✅ Top 3 return for Connect voice integration
- ✅ Error handling for generation and storage failures
- ✅ End-to-end testing with deployed infrastructure

### CI/CD Pipeline ✅
- ✅ GitHub Actions for testing and deployment
- ✅ OIDC for secure AWS auth (no stored credentials)
- ✅ Jest tests run on pull requests
- ✅ CDK deploys on main branch push
- ✅ Connect instance ARN from GitHub variables
- ✅ Production-ready deployment pipeline

## Phase 3: Amazon Connect Integration

### Connect Setup with Toll-Free Number
- ✅ Create Amazon Connect instance (manual)
- ✅ Add Lambda to Connect instance (manual)
- ✅ Contact flow that calls Generator Lambda (CDK-deployed)
- ✅ **Flow speaks TOP 3 vanity numbers to caller**
- ✅ Claim toll-free number and link to flow (manual)
- ✅ Test complete flow: call → generate 5 → store 5 → speak 3

### Voice Experience Requirements
- ✅ Connect announces "Here are your top 3 vanity numbers:"
- ✅ Speaks each vanity number clearly
- ✅ Handles edge cases (no good vanity options found)
- ✅ Test with various phone numbers

## Phase 4: Polish & Documentation

### Verification of Requirements
- ✅ **Document that exactly 5 numbers are stored per caller**
- ✅ **Verify Connect speaks exactly 3 numbers**
- ✅ Test multiple calls to same number (retrieval vs generation)
- ✅ Confirm scoring algorithm produces meaningful results

### Documentation & Demo ✅
- ✅ Update development journal with implementation details
- ✅ Document scoring algorithm and word selection
- ✅ Deployment guide with OIDC setup
- ✅ Security decisions and trade-offs (demo vs production)
- ✅ Fallback strategy implementation
- ✅ **AWS cost estimates** for the demo
- ✅ README with live phone number

### Final Testing Checklist
- ✅ Call toll-free number, verify 3 vanity numbers spoken
- ✅ Check DynamoDB shows 5 stored numbers
- ✅ Repeat calls use stored results
- ✅ Repo has complete code and docs

## Key Success Metrics

**Primary Requirements (Must Work)**
- 📱 Toll-free number answers and processes calls
- 🔢 Generates vanity numbers from caller phone number
- 💾 Stores exactly 5 best vanity numbers in DynamoDB
- 🗣️ Speaks exactly 3 vanity numbers back to caller
- 📚 Complete Git repo with documentation

**Demo Flow**
1. Call 1-833-866-4320
2. System generates vanity numbers from caller ID
3. Hear top 3 options spoken back
4. Check DynamoDB to see all 5 stored results

## Critical Success Factors

- **5 & 3 Rule**: Always store 5, always speak 3
- **Live Demo**: Working toll-free number is essential
- **Scoring Quality**: AI-generated business words show quality
- **Documentation**: Clear explanation of choices and implementation

---

*Remember: Store 5 vanity numbers, speak the top 3. This is the core requirement.*