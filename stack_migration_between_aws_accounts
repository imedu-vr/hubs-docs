# Stack migration between different AWS accounts

## Context
We have a running AWS stack on AWS company account A, and want to move it to AWS company account B 
Todo: (see also https://hubs.mozilla.com/docs/hubs-cloud-aws-backup-and-restore.html)
- Copy secrets
- Copy param stores
- Copy AWS Aurora Serverless database
- Copy AWS Elastic File Store volume 


## Steps
- Create a new AWS account form company B

### Copy the database snapshot
What we want to do is to copy a database snapshot to the new account. Unfortunately we can't copy a snapshot directly when it is encrypted with the default AWS KMS key (which is the case). 

The solution is to make a new AWS KMS key, that you share with the target organization. Then you createa a new copy of the snapshop that you encrypt with this shared key. You then share the repo, and on the target account you copy it another time and encrypt with the default AWS KMS key.

For more details and steps:[https://aws.amazon.com/premiumsupport/knowledge-center/share-encrypted-rds-snapshot-kms-key/](https://aws.amazon.com/premiumsupport/knowledge-center/share-encrypted-rds-snapshot-kms-key/)

