# Stack migration between different AWS accounts (WORK IN PROGRESS)

## Context
We have a running AWS stack on AWS company account A, and want to move it to AWS company account B.
Tip: 
- log in to AWS from two separate browsers, so you don't have to switch accounts
- make sure you work in the same AWS region

High level approach: (see also https://hubs.mozilla.com/docs/hubs-cloud-aws-backup-and-restore.html)
- Copy secrets
- Copy param stores
- Copy AWS Aurora Serverless database
- Copy AWS Elastic File Store volume 
- Start a new stack in company B, and restore from the (copied) backup

## Steps
- Create a new AWS account for company B

### Copy the database snapshot
What we want to do is to copy a database snapshot to the new account. Unfortunately we can't copy a snapshot directly when it is encrypted with the default AWS KMS key (which is the case). 

The solution is to:
- In company A: make a new AWS KMS key (keep default settings, only name and description), and share with the target organization.
- Find your snapshot under RDS > Snapshots > System
- Create a new copy of the RDS snapshot. Make sure that in the copy dialog you select the *new AWS KMS* key to encrypt. 
- Wait for the copy to finish, then share the copy with the target organization
- Log in as company B, make sure you are in the same region as company A
- Find the shared repo (under RDS > Snapshots > shared with me)
- Make a last copy, now select the default AWS Key for encryption
- You can now reuse the snapshot

For more details and steps: [https://aws.amazon.com/premiumsupport/knowledge-center/share-encrypted-rds-snapshot-kms-key/](https://aws.amazon.com/premiumsupport/knowledge-center/share-encrypted-rds-snapshot-kms-key/)


# TODO: figure out how copy the vault....
Here we take the following approach:
- Log in to company B, make sure you are in the same region as company A
- Create a new Customer managed Key in AWS KMS
- Create a new backup vault (still on company B), using this customer managed key

On company A
- Create a new AWS organization (couldn't find another way to do it)
- Invite company B to the organization
- Go to AWS Backup > Settings
- Enable 'Cross-account backup'
- Go to your vault, click on a restore point
- Copy it => select another account and backup vault. Make sure to use the IAM role under 'DailyBackupRole' from the "Resources" section of your stack in CloudFormation

- Todo: copying fails?

https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html
Links:
[https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html#share-vault-cab](https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html#share-vault-cab]
https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html


