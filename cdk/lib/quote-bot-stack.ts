import * as cdk from '@aws-cdk/core';
import { LazyRole, ServicePrincipal } from '@aws-cdk/aws-iam';
import { InstanceType } from '@aws-cdk/aws-ec2';
import { Cluster, ContainerDefinition, ContainerImage, Ec2TaskDefinition, MachineImageType } from '@aws-cdk/aws-ecs';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { Bucket, BlockPublicAccess } from '@aws-cdk/aws-s3';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

export class QuoteBotStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const quoteBotRole = new LazyRole(this, 'QuoteBotRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com', {}),
    });

    // The code that defines your stack goes here
    const quoteBotBucket = new Bucket(this, 'QuoteBucketBackup', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    new cdk.CfnOutput(this, 'S3Bucket', { value: quoteBotBucket.bucketName });
    quoteBotBucket.grantReadWrite(quoteBotRole);

    const quoteBotTable = new Table(this, 'Quotes', {
      partitionKey: {
        name: 'quoteIndex',
        type: AttributeType.NUMBER
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
    });
    new cdk.CfnOutput(this, 'DynamoDBTable', { value: quoteBotTable.tableName });
    quoteBotTable.grantReadWriteData(quoteBotRole);

    const quoteBotImage = new DockerImageAsset(this, 'QuoteBotImage', {
      directory: '../app/',
    });

    const cluster = new Cluster(this, 'QuoteBotCluster', {
      capacity: {
        instanceType: new InstanceType('t3.micro'),
        allowAllOutbound: true,
        associatePublicIpAddress: false,
        canContainersAccessInstanceRole: false,
        desiredCapacity: 1,
        machineImageType: MachineImageType.AMAZON_LINUX_2,
        maxCapacity: 1,
        minCapacity: 1,
      }
    });

    const taskDefinition = new Ec2TaskDefinition(this, 'QuoteBotTaskDefinition', {
      taskRole: quoteBotRole,
    });

    const containerImage = ContainerImage.fromEcrRepository(quoteBotImage.repository, quoteBotImage.imageUri.split(":").pop());

    const containerDefinition = new ContainerDefinition(this, 'QuoteBotContainer', {
      taskDefinition: taskDefinition,
      image: containerImage,
      memoryReservationMiB: 300,
    });
  }
}
