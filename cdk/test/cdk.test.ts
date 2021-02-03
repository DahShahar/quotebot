import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from '../lib/quote-bot-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Cdk.QuoteBotStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
