# Project Roadmap

**Goal**: Working vanity number service with live toll-free number demo

## Project Requirements (From Assignment)
- ✅ Lambda converts phone numbers to vanity numbers
- ✅ **Save the BEST 5 vanity numbers** to DynamoDB table
- ✅ **Return TOP 3 vanity numbers** for Connect integration
- ✅ Connect contact flow **says the TOP 3** vanity possibilities (CDK-deployed)
- 🔄 Live Amazon Connect phone number for testing (manual setup required)
- ✅ Git repo with all code and documentation

## Phase 1: Core Lambda Implementation ✅

### Vanity Generator Lambda (Modular Architecture)
- ✅ **Modular Design**: Refactored into 10 focused TypeScript modules
- ✅ **Type Safety**: Centralized types.ts with all interfaces and constants
- ✅ Clean phone number input (remove non-digits, handle formatting)
- ✅ Implement phone keypad mapping (2=ABC, 3=DEF, etc.)
- ✅ Create optimized English word dictionary (13,248 words with scores)
- ✅ Build scoring algorithm to rank vanity combinations
- ✅ **Generate and score vanity number combinations**
- ✅ **Select BEST 5 vanity numbers based on scoring**
- ✅ **Implement fallback strategy** (random letter combinations with deduplication)
- ✅ **Production enhancements**: PII masking, input validation, error handling
- ✅ **Save all 5 results to DynamoDB with caller's number**
- ✅ **Built-in caching**: Check existing records before generation
- ✅ **Return TOP 3** for Connect voice integration

### Testing Requirements Met
- ✅ **Jest TypeScript Testing**: Comprehensive test suite with proper type checking
- ✅ **Algorithm Testing**: Verified 90%+ success rate with English dictionary
- ✅ **Interactive Testing**: Built test tool showing successful word matching
- ✅ **Production Testing**: Confirmed PII masking, validation, error handling
- [ ] Verify exactly 5 numbers saved to DynamoDB
- [ ] Confirm top 3 are returned to Connect
- [ ] Test with multiple caller numbers

## Phase 2: AWS Infrastructure

### CDK Deployment
- ✅ Define DynamoDB table schema (phone number + 5 vanity results)
- ✅ Deploy Lambda function with proper DynamoDB permissions
- ✅ Set up environment variables (DynamoDB table name, LOG_LEVEL)
- ✅ Configure Lambda timeout settings (30 seconds, ARM64, structured logging)
- ✅ Fix AWS SDK v3 bundling for runtime compatibility
- ✅ Add Connect IAM permissions for Lambda invocation
- ✅ Configure CDK to deploy contact flow when CONNECT_INSTANCE_ARN is set
- ✅ Dynamic Lambda ARN injection into Connect flow template
- [ ] Deploy to AWS and test deployed functions meet 5-store/3-return requirement

### Data Validation
- ✅ Implement caching strategy with exactly 5 vanity numbers per caller
- ✅ Configure top 3 return for Connect voice integration
- ✅ Add comprehensive error handling for generation and storage failures
- [ ] End-to-end testing with deployed infrastructure

### CI/CD Pipeline ✅
- ✅ GitHub Actions workflow for automated testing and deployment
- ✅ OIDC federation for secure AWS authentication (no stored credentials)
- ✅ Automatic Jest test execution on pull requests
- ✅ Automated CDK deployment on main branch push
- ✅ Support for Connect instance ARN via GitHub repository variables
- ✅ Production-ready deployment pipeline with proper security

## Phase 3: Amazon Connect Integration

### Connect Setup with Toll-Free Number
- [ ] Create Amazon Connect instance (manual)
- [ ] Add Lambda function to Connect instance (manual)
- ✅ Build contact flow that calls Generator Lambda (CDK-deployed)
- ✅ **Configure flow to speak TOP 3 vanity numbers to caller**
- [ ] Claim toll-free number and associate with flow (manual)
- [ ] Test complete flow: call → generate 5 → store 5 → speak 3

### Voice Experience Requirements
- [ ] Connect announces "Here are your top 3 vanity numbers:"
- [ ] Speaks each vanity number clearly
- [ ] Handles edge cases (no good vanity options found)
- [ ] Test with various phone numbers

## Phase 4: Polish & Documentation

### Verification of Requirements
- [ ] **Document that exactly 5 numbers are stored per caller**
- [ ] **Verify Connect speaks exactly 3 numbers**
- [ ] Test multiple calls to same number (retrieval vs generation)
- [ ] Confirm scoring algorithm produces meaningful results

### Documentation & Demo ✅
- ✅ Update development journal with implementation details
- ✅ Document scoring algorithm and word selection process
- ✅ Create comprehensive deployment guide with OIDC setup
- ✅ Document security decisions and trade-offs (demo vs production)
- ✅ Document fallback strategy implementation
- ✅ **Calculate and document AWS cost estimation** for the demo
- [ ] **Record demo video calling toll-free number**
- [ ] Update README with live phone number for testing

### Final Testing Checklist
- [ ] Call toll-free number and verify 3 vanity numbers spoken
- [ ] Check DynamoDB shows 5 stored numbers
- [ ] Test repeat calls use stored results
- [ ] Verify repo has complete code and docs

## Key Success Metrics

**Primary Requirements (Must Work)**
- 📱 Toll-free number answers and processes calls
- 🔢 Generates vanity numbers from caller's phone number
- 💾 Stores exactly 5 best vanity numbers in DynamoDB
- 🗣️ Speaks exactly 3 vanity numbers back to caller
- 📚 Complete Git repo with documentation

**Demo Script**
1. "Call [your toll-free number]"
2. "System generates vanity numbers from your caller ID"
3. "Hear the top 3 options spoken back"
4. "Check DynamoDB to see all 5 stored results"

## Critical Success Factors

- **5 & 3 Rule**: Always store 5, always return/speak 3
- **Live Demo**: Working toll-free number is essential
- **Scoring Quality**: AI-generated business words show sophistication
- **Documentation**: Clear explanation of choices and implementation

---

*Remember: Store 5 vanity numbers, speak the top 3. This is the core requirement.*