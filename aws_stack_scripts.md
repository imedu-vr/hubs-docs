# AWS CLI Scripts for remotely updating your stack

Requirements:
- Install the AWS CLI (see https://aws.amazon.com/cli/)
- Make sure you have access to the private key which was used to create the stack

This is basically a standard AWS script that you can use to update your stack without having to login and go through the UI. It requires you to provide the (new) template parameter values, or you can use 'UsePreviousValue' to keep it the same. The parameters are the same as the ones in the templates as shown in Cloudformation

Some notes:
- There are different ways to provide parameters to this AWS CLI script, but I had issues with the space in the 'Offline - Temporarily shut off servers' setting. This JSON format was the only one that worked. 
- I'm sure you can also adjust this script for multi-server templates, probably you just try to run it (use a test stack!), and it will complain if you miss any parameters.

Usage:
I added parameters for 3 common changes, but you can adjust the script to add more. You can even run this with a cron-job or automate it in a serverscript that scales your stack based on expected load.

`./updatestack.sh -s my-hubs-stack -i t3.medium -m online`
- s: the stack name you want to update
- i: change the instance type for the stack
- m: set stack to online or offline


## Script Hubs Cloud stack personal edition (single server)
```
#!/bin/bash
# filename: updatestack.sh

## defaults
stack=""
instance="t3.small"
mode=""

usage() { echo "Usage: $0 -s <stack name> -m <online|offline> [-i <instance type>]" 1>&2; exit 1; }

while getopts ":s:i:m:" o; do
    case "${o}" in
        s)
            stack=${OPTARG}
            ;;
        i)
            instance=${OPTARG}
            ;;
        m)
            ((m == 'online' || m == 'offline')) || usage
            mode=${OPTARG}
            ;;
    esac
done
shift $((OPTIND-1))

if [[ "$mode" == "online" ]]; then
    mode="Online"
elif [[ "$mode" == "offline" ]]; then
    mode="Offline - Temporarily shut off servers"
else
    mode=""
fi

if [ -z "${stack}" ] || [ -z "${mode}" ]; then
    usage
fi

echo "Updating stack with params:"
echo "---------------------------"
echo "STACK        = ${stack}"
echo "INSTANCE     = ${instance}"
echo "OFFLINE MODE = ${mode}"

aws cloudformation update-stack --stack-name $stack --use-previous-template --parameters "[{\"ParameterKey\":\"AppInstanceType\",\"ParameterValue\":\"$instance\"},{\"ParameterKey\":\"StackOffline\",\"ParameterValue\":\"$mode\"},{\"ParameterKey\":\"AdminEmailAddress\",\"UsePreviousValue\":true},{\"ParameterKey\":\"UnmanagedDomainEastCertArn\",\"UsePreviousValue\":true},{\"ParameterKey\":\"RestoreRecoveryPointArn\",\"UsePreviousValue\":true},{\"ParameterKey\":\"SpecifyInboundSSHCidr\",\"UsePreviousValue\":true},{\"ParameterKey\":\"InboundSSHCidrOverride\",\"UsePreviousValue\":true},{\"ParameterKey\":\"ShortlinkZone\",\"UsePreviousValue\":true},{\"ParameterKey\":\"RestoreDbSnapshotIdentifier\",\"UsePreviousValue\":true},{\"ParameterKey\":\"StackOfflineRedirectUrl\",\"UsePreviousValue\":true},{\"ParameterKey\":\"EmailZone\",\"UsePreviousValue\":true},{\"ParameterKey\":\"KeyPair\",\"UsePreviousValue\":true},{\"ParameterKey\":\"RestoreAppDbSecretArn\",\"UsePreviousValue\":true},{\"ParameterKey\":\"InternalZone\",\"UsePreviousValue\":true},{\"ParameterKey\":\"DomainName\",\"UsePreviousValue\":true},{\"ParameterKey\":\"RestoreStackName\",\"UsePreviousValue\":true},{\"ParameterKey\":\"InboundCidrOverride\",\"UsePreviousValue\":true},{\"ParameterKey\":\"IsDomainOnRoute53\",\"UsePreviousValue\":true},{\"ParameterKey\":\"UnmanagedDomainCertArn\",\"UsePreviousValue\":true},{\"ParameterKey\":\"RestoreBackupVaultName\",\"UsePreviousValue\":true}]" --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
```

