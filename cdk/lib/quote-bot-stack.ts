import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as s3 from '@aws-cdk/aws-s3';
import * as ssm from '@aws-cdk/aws-ssm';
import * as ddb from '@aws-cdk/aws-dynamodb';

import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';

export class QuoteBotStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const quoteBotRole = new iam.LazyRole(this, 'QuoteBotRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com', {}),
    });

    const quoteBotPolicies = new iam.PolicyDocument();
    const readCfnPolicy = new iam.PolicyStatement();
    readCfnPolicy.addActions('cloudformation:DescribeStacks');
    readCfnPolicy.addResources(this.stackId);
    quoteBotPolicies.addStatements(readCfnPolicy);

    quoteBotRole.attachInlinePolicy(
      new iam.Policy(this, 'QuoteBotPolicy', {
        document: quoteBotPolicies
      })
    );

    const quoteBotToken = ssm.StringParameter.fromStringParameterAttributes(this, 'QuoteBotParam', {
      parameterName: '/quoteBot/token',
    });
    quoteBotToken.grantRead(quoteBotRole);


    const quoteBotBucket = new s3.Bucket(this, 'QuoteBucketBackup', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    new cdk.CfnOutput(this, 'S3Bucket', { value: quoteBotBucket.bucketName });
    quoteBotBucket.grantReadWrite(quoteBotRole);

    const quoteBotTable = new ddb.Table(this, 'Quotes', {
      partitionKey: {
        name: 'quoteIndex',
        type: ddb.AttributeType.NUMBER
      },
      billingMode: ddb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
    });
    new cdk.CfnOutput(this, 'DynamoDBTable', { value: quoteBotTable.tableName });
    quoteBotTable.grantReadWriteData(quoteBotRole);

    const quoteBotImage = new DockerImageAsset(this, 'QuoteBotImage', {
      directory: '../app/',
    });

    const quoteBotVpc = new ec2.Vpc(this, 'QuoteBotVpcV2', {
      maxAzs: 1,
      // while not best practice, we want this to remain as free as possible. As such, no NAT involved.
      subnetConfiguration: [{
        name: 'Public01',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    });

    const cluster = new ecs.Cluster(this, 'QuoteBotCluster', {
      capacity: {
        instanceType: new ec2.InstanceType('t3.micro'),
        allowAllOutbound: true,
        associatePublicIpAddress: true,
        canContainersAccessInstanceRole: false,
        machineImageType: ecs.MachineImageType.AMAZON_LINUX_2,
        maxCapacity: 1,
        minCapacity: 1,
      },
      vpc: quoteBotVpc,
    });

    cluster.connections.allowToAnyIpv4(ec2.Port.allTcp());

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'QuoteBotTaskDefinition', {
      taskRole: quoteBotRole,
    });

    const containerImage = ecs.ContainerImage.fromEcrRepository(quoteBotImage.repository, quoteBotImage.imageUri.split(':').pop());

    taskDefinition.addContainer('QuoteBotContainer', {
      image: containerImage,
      memoryReservationMiB: 300,
      environment: {
        ['QUALIFIER']: '-',
        ['AWS_REGION']: this.region,
      },
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'quoteBot',
      }),
    });

    const quoteBotService = new ecs.Ec2Service(this, 'QuoteBotService', {
      cluster,
      taskDefinition,
    });
  }
}
