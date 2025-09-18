#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsVanityServiceStack } from '../lib/aws-vanity-service-stack';

const app = new cdk.App();
new AwsVanityServiceStack(app, 'AwsVanityServiceStack');