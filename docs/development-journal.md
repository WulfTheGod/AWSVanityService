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

### Next Steps
- Implement Lambda logic for generation
- Write DynamoDB helper functions