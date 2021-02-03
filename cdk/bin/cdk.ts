#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { QuoteBotStack } from '../lib/quote-bot-stack';

const app = new cdk.App();
new QuoteBotStack(app, 'QuoteBotStack');
