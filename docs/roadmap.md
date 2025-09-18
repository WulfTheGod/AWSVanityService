# Project Roadmap

**Goal**: Working vanity number service with live toll-free number demo

## Project Requirements (From Assignment)
- ✅ Lambda converts phone numbers to vanity numbers
- ✅ **Save the BEST 5 vanity numbers** to DynamoDB table
- ✅ Connect contact flow **says the TOP 3** vanity possibilities
- ✅ Live Amazon Connect phone number for testing
- ✅ Git repo with all code and documentation

## Phase 1: Core Lambda Implementation ✅

### Generator Lambda (Primary Function)
- [x] Clean phone number input (remove non-digits, handle formatting)
- [x] Implement phone keypad mapping (2=ABC, 3=DEF, etc.)
- [x] Create optimized English word dictionary (13,248 words with scores)
- [x] Build scoring algorithm to rank vanity combinations
- [x] **Generate and score vanity number combinations**
- [x] **Select BEST 5 vanity numbers based on scoring**
- [x] **Implement fallback strategy** (random letter combinations with deduplication)
- [x] **Production enhancements**: PII masking, input validation, error handling
- [ ] **Save all 5 results to DynamoDB with caller's number**

### Retriever Lambda (For Connect)
- [ ] Query DynamoDB for existing vanity numbers by phone number
- [ ] **Return TOP 3 vanity numbers** (from the stored 5)
- [ ] Handle cases where no vanity numbers exist
- [ ] Format response for Connect voice output

### Testing Requirements Met
- [x] ✅ **Algorithm Testing**: Verified 90%+ success rate with English dictionary
- [x] ✅ **Interactive Testing**: Built test tool showing successful word matching
- [x] ✅ **Production Testing**: Confirmed PII masking, validation, error handling
- [ ] Verify exactly 5 numbers saved to DynamoDB
- [ ] Confirm top 3 are returned to Connect
- [ ] Test with multiple caller numbers

## Phase 2: AWS Infrastructure

### CDK Deployment
- [ ] Define DynamoDB table schema (phone number + 5 vanity results)
- [ ] Deploy both Lambda functions with proper permissions
- [ ] Set up environment variables (DynamoDB table name, region)
- [ ] Configure Lambda timeout settings (under 8 seconds for Connect)
- [ ] Test deployed functions meet 5-store/3-return requirement

### Data Validation
- [ ] Verify DynamoDB stores exactly 5 vanity numbers per caller
- [ ] Confirm retrieval returns top 3 for Connect voice
- [ ] Test error handling when generation fails

## Phase 3: Amazon Connect Integration

### Connect Setup with Toll-Free Number
- [ ] Create Amazon Connect instance
- [ ] Configure toll-free number
- [ ] Build contact flow that calls Generator Lambda
- [ ] **Configure flow to speak TOP 3 vanity numbers to caller**
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

### Documentation & Demo
- [ ] Update development journal with implementation details
- [ ] Document scoring algorithm and AI word selection process
- [ ] **Record demo video calling toll-free number**
- [ ] Update README with live phone number for testing
- [ ] Document fallback strategy implementation
- [ ] **Calculate and document AWS cost estimation** for the demo

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