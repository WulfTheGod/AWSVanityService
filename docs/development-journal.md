# Development Journal

## Day 1: September 18, 2025
### Focus
- Set up repo and CDK project structure
- Planned Lambda + DynamoDB + Connect integration

### Key Decisions
- Use AWS CDK with TypeScript for IaC
- Adopt modular folder structure (`lambda/`, `utils/`, `types/`) for clarity
- Chose dictionary-based scoring for vanity number generation

### Challenges
- Defining "best" vanity number → solution: multi-factor scoring (word quality, length, memorability)

### Implementation Progress
**Phone Number Cleaning (Completed)**
- Built `cleanPhoneNumber()` function to handle various input formats
- Supports Amazon Connect E.164 format (+15551234567)
- Removes non-digits and strips country code automatically
- Created comprehensive test suite with 8 test cases
- All tests passing - ready for vanity generation

### Technical Notes
- Used regex `/[^0-9]/g` to strip non-digits efficiently
- Handles 11-digit numbers by removing leading '1' country code
- Test-driven approach ensured edge cases are covered

**Phone Keypad Mapping (Completed)**
- Implemented standard keypad letter mapping using object lookup pattern
- Added helper function for digit-to-letter conversion with error handling
- Comprehensive test suite covers all digits plus edge cases
- Focus on last 7 digits approach for better vanity number quality

### Testing Approach
- Test structure and comprehensive case coverage developed with AI assistance
- All test logic manually reviewed and validated for accuracy
- Emphasis on edge cases, error handling, and real-world scenarios

**Production Logging Implementation (Completed)**
- Replaced console.log with AWS Lambda Powertools structured logging
- Added service name tagging for better CloudWatch organization
- Structured JSON logs enable better filtering and searching in production
- Request correlation tracking for debugging individual function calls

### Technical Infrastructure Decisions
**Why AWS Lambda Powertools Logger:**
- Industry standard for production Lambda functions
- Structured JSON output enables better log analysis
- Built-in request correlation and service tagging
- Better performance than basic console logging
- Follows AWS Well-Architected Framework recommendations

**Business Word Dictionary (Completed)**
- Created AI-curated dictionary of business-relevant terms for optimal vanity numbers
- Focus on last 7 digits strategy for professional appearance (555-CALL-NOW vs JKLCALLNOW)
- Structured scoring system with categories (action, service, quality, industry)
- Pre-calculated digit mappings for performance optimization
- Bundled with Lambda for fast, serverless access

### Design Decisions
**Why Last 7 Digits:**
- Follows industry standard (1-800-FLOWERS pattern)
- Better visual appearance and memorability
- More manageable combination space for real-time processing
- Allows area code to remain as recognizable numbers

**Why AI-Generated Dictionary:**
- Ensures comprehensive coverage of business terminology
- Optimized for memorability and commercial value
- Consistent scoring methodology across word categories
- Faster than manual curation while maintaining quality

### Algorithm Design Challenges

**Vanity Number Positioning Strategy:**
- Challenge: Should words appear in fixed positions for consistency?
- Example phone: `555-462-5226` could match word "GOAL" (4625)
  - Option A: `555-GOAL-226` (fixed position, professional appearance)
  - Option B: `55GOAL5226` (flexible position, inconsistent formatting)

**Considerations:**
- **Professional appearance**: Fixed positioning looks cleaner for business use
- **Marketing value**: Consistent format easier to remember and communicate
- **Voice clarity**: Connect will speak results - clean format reduces confusion
- **Match success rate**: Fixed positions may reduce successful word matches

**Business Impact:**
- Consistent formatting demonstrates attention to professional requirements
- Clean presentation shows understanding of real-world vanity number usage
- Industry standards follow patterns like `1-800-FLOWERS` (area-exchange-WORD)

### Current Challenge: Dictionary Match Success Rate

**Problem Discovered:**
- Tested interactive vanity generator with 10 real phone numbers from contacts
- Result: 0/10 numbers found any dictionary word matches
- Success rate appears to be <1% with current exact-match approach

**Root Cause Analysis:**
- Phone numbers are essentially random digit sequences
- Dictionary requires exact digit sequences (e.g., CALL = 2255)
- Probability of any specific 4-digit sequence in 7 random digits ≈ 0.01%
- Even with 80+ business words, overall probability remains very low

**Strategic Decision Point:**
- **Option A**: Maintain strict word matching, rely heavily on fallback strategy
  - Pro: Perfect words when found, professional quality
  - Con: 90%+ of calls will use fallback, potentially disappointing demo

- **Option B**: Implement flexible matching rules
  - Partial words (CA from CALL), letter substitutions, hybrid combinations
  - Pro: Higher success rate, guaranteed results
  - Con: Lower quality matches, more complex algorithm

- **Option C**: Generate random letter combinations with no real words
  - Convert all digits to letters using simple patterns
  - Pro: 100% success rate, simple implementation, always returns results
  - Con: No meaningful words, random combinations like "HJKLAB" not memorable

**Business Impact:**
- Low success rate could make system appear broken during demo
- Evaluators testing with random numbers would likely see fallback results
- Need to balance word quality vs. response reliability

**Current Status:**
- Researching optimal approach for demo success
- Considering hybrid strategy with tiered matching rules
- Priority: Ensure system always returns meaningful results

### Next Steps
- Decide on matching strategy (strict vs. flexible)
- Implement chosen vanity number generation algorithm
- Build robust fallback strategy regardless of approach
- Test with larger sample of phone numbers for validation