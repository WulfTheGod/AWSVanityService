import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AwsVanityServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: Define Lambda function
    // TODO: Define DynamoDB table
    // TODO: Set up IAM permissions
  }
}