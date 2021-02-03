import * as cdk from '@aws-cdk/core';
import { Bucket, BlockPublicAccess } from '@aws-cdk/aws-s3';

export class QuoteBotStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const quoteBotBucket = new Bucket(this, 'QuoteBucketBackup', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    new cdk.CfnOutput(this, 'S3Bucket', { value: quoteBotBucket.bucketName });
  }
}
