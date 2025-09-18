# References & Resources

## AWS Documentation Used So Far

### Project Setup
- [AWS CDK Getting Started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) - Initial CDK setup and project structure

### Understanding the Assignment
- [Amazon Connect Admin Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html) - Understanding what Connect does
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) - Basic Lambda concepts

### Lambda Implementation
- [Lambda Handler in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) - Handler function signature and event processing
- [Amazon Connect Lambda Function Input Event](https://docs.aws.amazon.com/connect/latest/adminguide/connect-lambda-functions.html#function-input) - Understanding Connect event structure
- [Lambda Error Handling](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-exceptions.html) - Proper error handling patterns
- [AWS Lambda Powertools](https://docs.powertools.aws.dev/lambda/typescript/latest/) - Production-ready logging and observability
- [Lambda ARM64 Architecture](https://aws.amazon.com/blogs/aws/aws-lambda-functions-powered-by-aws-graviton2-processor-run-your-functions-on-arm-and-get-up-to-34-better-price-performance/) - Performance and cost optimization

### DynamoDB Integration
- [DynamoDB SDK v3 for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/) - Modern AWS SDK usage
- [DynamoDB Document Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/lib/lib-dynamodb/) - Simplified DynamoDB operations
- [DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) - Automatic item expiration
- [DynamoDB Single-Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/) - Design patterns for NoSQL

### CDK Infrastructure
- [AWS CDK TypeScript Reference](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html) - Lambda constructs
- [CDK Lambda-NodeJS Function](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html) - Bundling and deployment
- [CDK DynamoDB Table](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb-readme.html) - Table configuration

## Research & Planning

### Phone Number Processing
- [E.164 Phone Number Format](https://docs.aws.amazon.com/connect/latest/adminguide/phone-number-requirements.html) - Understanding Connect phone number format

### Business Research
- Researched commercial vanity number examples (1-800-FLOWERS, 1-800-CALL-ATT)

### Algorithm & Data Resources
- [an-array-of-english-words](https://www.npmjs.com/package/an-array-of-english-words) - Comprehensive English word list for dictionary generation
- [T9 Predictive Text](https://en.wikipedia.org/wiki/T9_(predictive_text)) - Understanding phone keypad letter mapping
- [Vanity Number Industry Standards](https://en.wikipedia.org/wiki/Phoneword) - Research on commercial vanity number patterns

### Community Resources
- [r/aws](https://www.reddit.com/r/aws/) - AWS best practices and community insights
- [AWS CDK Examples](https://github.com/aws-samples/aws-cdk-examples) - Reference implementations
- [Lambda Powertools Community](https://github.com/aws-powertools/powertools-lambda-typescript) - Open source observability patterns

### Development Tools
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Language reference and best practices
- [Jest Testing Framework](https://jestjs.io/docs/getting-started) - JavaScript testing framework
- [ts-jest](https://kulshekhar.github.io/ts-jest/) - TypeScript preprocessor for Jest
- [esbuild](https://esbuild.github.io/) - Fast JavaScript bundler used by CDK
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Production-ready Node.js patterns

---

*All resources verified and used during active development of this vanity number service.*
