import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class AwsVanityServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vanityTable = new dynamodb.Table(this, 'VanityNumbersTable', {
      partitionKey: {
        name: 'phoneNumber',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const vanityGeneratorFunction = new nodejs.NodejsFunction(this, 'VanityGeneratorFunction', {
      functionName: 'vanity-generator',
      entry: 'src/lambda/vanity-generator/index.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        VANITY_TABLE_NAME: vanityTable.tableName,
        NODE_ENV: 'production',
        LOG_LEVEL: 'INFO'
      }
    });

    vanityTable.grantReadWriteData(vanityGeneratorFunction);

    new cdk.CfnOutput(this, 'VanityGeneratorFunctionArn', {
      value: vanityGeneratorFunction.functionArn,
      description: 'ARN of the vanity generator Lambda function for Amazon Connect'
    });

    new cdk.CfnOutput(this, 'VanityTableName', {
      value: vanityTable.tableName,
      description: 'Name of the DynamoDB table storing vanity numbers'
    });
  }
}