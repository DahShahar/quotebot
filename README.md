## What?

A quote bot for Discord.

This is a pretty simple bot, in that all it does is quote you to your friends.

It's meant to be self-deployable, so you could always deploy this yourself. All you need to do is the following:
1. Create an AWS account -- everything in this bot should be free tier. This should cost you less than $1 to run on your own, less if you clean up well.
2. Create a Discord application, and then a bot
3. Put the bot's secret in AWS Systems Manager Parameter Store as a plain text parameter (to keep things cheap).
4. Deploy the CDK via `cdk deploy`

Once done, everything else should be taken care of, and you just need to invite the bot to the correct server.

### How to use it

Put it in discord, then execute the usage command. To do so, send the bot a message such as:

```
!usage
```

Assuming you set your bot's qualifier to `!`. This will tell you everything you can do in the bot.
