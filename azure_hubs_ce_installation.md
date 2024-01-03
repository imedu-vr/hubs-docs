
> This document is still work in progress, although most of it is working. Remaining issues are listed under TODO

# TODO


- Solve issue with Dialog server WebRTC
  - Check out TURN server (is it there?) ⇒ will give issues when webRTC ports are not available

- Finalize instructions for custom client

- Migrate data

- Check video support now support for Youtube video seems to be removed (ytll).
<https://discord.com/channels/498741086295031808/819188464145924117/1186738741755256942>

- Still showing 404s on some files from https://assets.yourdomain when opening Spoke (e.g. the spoke logo)

- For production: consider to use a seperate database service, instead of persistent storage?

- Add some information about managed identities and service principals


# Contents

- Preparations & important concepts

- Installation

  - Install command line tools

  - Create a Kubernetes cluster

  - Setup your domain + email service

  - Access your cluster

  - Deploy Hubs CE

  - Connect your domain to Hubs CE

  - Set up your certificates

  - Add persistent storage for files and database

  - Setup container registry for custom client code

  - Deploy custom client

- Tips & problem solving

# Preparations & important concepts

>_This installation manual for Hubs Community Edition on Azure was based on community edition status of Dec 18 2023, and includes some tips from the Hubs community. Disclaimer: I'm not an expert on Azure, so their might be betters ways to do this._

Make sure to read the whole manual before starting, including the steps for installing Hubs (under Deploy hubs), to see which domains and other settings you need.

There is a lot to learn about Kubernetes and Azure, which you can find in the online tutorials. Here are some important concepts to understand for this manual:

## Understanding Docker and Kubernetes

While Kubernetes works with docker containers, you need to have some basic understand how these are created, managed and used for installations. This could be a good introduction: <https://www.youtube.com/watch?v=pg19Z8LL06w>

Understanding the core concepts of Kubernetes will also be essential to help you understand the installation steps and structure in Azure.

This video provides a good overview in about 30 minutes: <https://youtu.be/s_o8dwzRlu4?si=B0Ay2rvhrLTO9Hq1> (you can optionally skip the second part where they setup a cluster on a different platform)

## Understanding Azure

Explaining Azure and all it's services and options goes beyond the scope of this instruction. The best way to start is probably the 'Quickstart Center' (you can find that in the portal) <https://portal.azure.com/#view/Microsoft_Azure_Resources/QuickstartCenterBlade>

### Introduction to Azure Kubernetes Service

If you prefer to 'learn while doing', it might be smart to at least read this overview of AKS (a managed Kubernetes service on Azure): <https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes>

### Access control using Managed Identities and Service Principals

Managed identies are a way to let services use other services within your Azure environment, without having to store or manage credentials.

Managed identities are handled by Active Directory (called Microsoft Entra ID), and a managed identity is linked to a 'service principal' in the AD backend. So most of the time you could see this as two things referring to the same thing. There is a seperate portal section for creating managed identities, just search for 'Managed Identities' to find it.

#### System assigned managed identities

Every service in Azure automatically gets a system assigned managed identity. And you can use this identity when assigning role based access. When the service dissappears, the managed identity also dissappears, including the access rights.

#### User assigned managed identities

Besides the system assigned managed identities, you can assign 'custom' managed identities as a user. These can be created as much as you like, and can also be used in role based assignments. By default these identities are not linked to a service, but you can do that by going to the 'Identity' page under a service. Here you can add alternative identites for the service.

#### Authenticate as a service principal using Entra ID applications

Finally, there are registered applications in Azure Active Directory ('Microsoft Entra ID'). These provide authentication and authorization services for applications. When you register an app in Microsoft Entra ID it also creates a service principal in the backend, that you can use in the same way for role-based access. Besides that, you can also generate seperate credentials so you can authenticate as that service principal from an external system.

For a good introduction + video, see: <https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview>

# Installation process

## Install command line tools

Open a terminal to install the required command-line tools to access Azure and control your Kubernetes cluster.

- Follow these instruction to install Azure CLI tools <https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew>

- Install kubectl with the following commands

```bash
brew install kubectl
brew install Azure/kubelogin/kubelogin 
```

(see <https://azure.github.io/kubelogin/install.html> )

## Create a Kubernetes cluster

- Create Kubernetes cluster using the Azure portal 
    
  - Go to Kubernetes service and click 'Create'

  - Create a new resource group
    _Important: you can't change this afterwards! If you made a mistake, you may try to create a new resource group, and move the resouces in the group, but that doesn't always work_

  - Cluster preset configuration:

    - For dev use the dev/test profile

    - For production use Production ('Standard' or 'Economy' for free/cost-saving option)

    - Enter a cluster name (note: you can't change this afterwards! )

    - Select the region and availability zones where you want to run your cluster

    - Select how you want to Authorize and Authenticate. This depends on how you want to manage accounts and access across your Azure enviroment. Default 'Local accounts with Kubernetes RBAC' should be ok for your (first) installation. You can also use Active Directory to control your accounts and optionally control role based access.
   
    - If you need/want to change the VM size for your node pool, DS2_v2 sounds like a good start as it has a similar number of cores and more memory then AWS EC2 C4 large (which was always recommended by Hubs to choose). However, this might need some further monitoring and investigation.   

### Create access for user when using Azure RBAC (not tested yet!)

(This step can be skipped if you are using Local accounts with kubernetes RBAC)
See this manual for detailed steps => <https://learn.microsoft.com/en-us/azure/aks/manage-azure-rbac#create-role-assignments-for-users-to-access-cluster>

- Go to the new Resource group in Azure portal
- Go to the IAM section
- Add a role assigment for K8 (Use 'Admin Cluster') and include your user as 'member' of the role assignment

## Setup your domain + email service

Use an external DNS provider to buy the domain and optionally buy/request a wildcard certificate (see below 'Connect your domain'). Or you should be able to (partially) use Azure Hosted Zones for this, which I don't know about so I can't elaborate about that.

To set up an SMTP service, follow these steps:

- Set up an Azure Communication service to serve as an SMTP service. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/create-email-communication-resource>
- Set up an active Azure Email Communication Services Resource connected with Email Domain and a Connection String. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/connect-email-communication-resource>.
- Set up a new Entra app with rights to write/send emails, and provide SMTP access via an Entra app that has access to the Azure Communication Service. Leveraging the service principal of an Entra app (and not just a user managed identity) is apparently how Azure implements SMTP credentials. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication>

>Important! Make sure to add noreply@\<yourdomain\> as a verified Sender address in the Email Communication Service. Open your domain under 'Provision domains' and click 'MailFrom addresses' to add it. Otherwise you will see errors in the recticulum logs, saying 'Email sender address not allowed' and no login mails will be sent.

## Access your cluster

- Find you cluster in the portal (Kubernetes services)

- Click on 'connect' and follow the instructions in a terminal, to connect to your cluster on the command line

## Deploy Hubs CE

Read this manual for detailed steps => <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>

- Clone the hubs repo

- Go to the /community-edition directory

- Connect to your cluster (see above)

- Change the setup values in the installation script `render_hcce_sh`

- Follow the instructions and run : `bash render_hcce.sh && kubectl apply -f hcce.yaml`

>Tip: use a docker image to avoid issues with local versions of openssl, see 'Use Docker image to deploy' below

- Make sure to check the ouput logs, you are problably missing an NPM package (pem-jwk) . Install it using the instructions given (this is already included in the Docker image)

## Connect your domain to Hubs CE

- To find the public IP of your Kubernetes cluster on Azure, call `kubectl -n hcce get svc lb` (the namespace, here 'hcce', was set by you and can be found in the portal)
- Set the DNS entries for \<your-domain\>, assets.\<domain\>, stream.\<domain\> and cors.\<domain\> to the public IP of the cluster

**You should now be able to access your cluster (with bypassing the warning for self-signed certificates)!**

## Set up your certificates

You could try installing the certificates with certobot (see <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>), but this didn't work for me. It kept provisioning 'self-signed certificates'

To install your own certs, you need to update them in the Azure secrets for you main domain and the assets, cors, stream subdomains

- To list all secrets: `kubectl get secrets -n hcce`

You will see something like this:

```bash
# Change the following
cert-assets.<your domain>   kubernetes.io/tls   2      36h
cert-cors.<your domain>     kubernetes.io/tls   2      36h
cert-<your domain>          kubernetes.io/tls   2      36h
cert-stream.<your domain>   kubernetes.io/tls   2      36h

# Leave this

cert-hcce                   kubernetes.io/tls   2      40h
configs                     Opaque              20     40h
```

- While tls secrets are immutable, you are not able to edit the certficate using the Azure portal (or even using `kubectl edit secret cert-<your-domain> -n hcce`)

- The easiest way is to delete the secret and recreate them with the same name and your own certificates. (**Don't forget to create them in the right namespace, in this case `hcce`, and create a backup of the certs before you delete them. This can be done by using the portal to view the contents of the secrets as explained further below**)

```bash
kubectl delete secret cert-<your-domain> -n hcce
kubectl create secret tls cert-<your-domain> -n hcce --cert=path_to_certs/certificate.pem --key=path_to_certs/key.pem
```

- Make sure to build your certificate.pem with the domain certificate _on top_ and paste the cabundle below that.

- If you already visited your cluster, it might take a while before the cached self-signed certificates are updated. You could check the validity of your new certificates at e.g. https://stream.\<your-domain\> as that might not have been cached yet.

### Fix for main domain certificate not working

When your main certificate is not working, change the default-ssl-certificate in the haproxy config (in hcce.yaml), to point to your main domain certificate secret

```yaml
https://discord.com/channels/498741086295031808/1181690949156470925/1181742705001386054
      containers:
        - name: haproxy
...
            - --log=warning #error warning info debug trace
            # REPLACE THIS LINE
            - --default-ssl-certificate=$Namespace/cert-hcce
            # INTO THIS LINE
            - --default-ssl-certificate=$Namespace/<NAME OF YOUR MAIN DOMAIN CERTIFICATE SECRET>
```

## Add persistent storage for files and database

By default the volumes in the pod are ephemeral, which results in data-loss when deleting a pod. To work around that we need to connect our volumes to a persistent storage solution. See this article for more details about (persistant) storage in Azure Kubernetes Services: <https://learn.microsoft.com/en-us/azure/aks/concepts-storage>

> Applying this will remove existing accounts and content as it moves the storage location of files and database. Make sure to test this well before you start actively using your cluster. With this setup you should be able to delete all pods, while keeping accounts, scenes, rooms and objects in rooms.

The cluster contains a recticulum server and a postgress DB, which both store their data on disk. In these steps we are moving this storage to a persistent Azure Disk.


- Create a new storage account, (use default settings where given)

- On the 'Networking' tab, set the `network access` to Enable public access from selected virtual networks and IP addresses. In the configuration field, choose the Virtual Network in which your cluster is installed. This should block public access.

- Finish the process and create your storage account

We need to add a `Persistent Volume Claim` to our cluster, to which we can connect our recticulum storage. Note that this will automatically create a `Persistent volume`, based on the given (default) Storage Class. Once we created this, we can change the recticulum and postgresdb config in `hcce.yaml` to use this new persistent storage. For details see: <https://learn.microsoft.com/en-us/azure/aks/azure-csi-disk-storage-provision>

- Create and adjust the following azure-pvc.yaml file, to create the PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-disk
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: default
  resources:
    requests:
      storage: 10Gi
```

- Apply the configuration to your cluster with `kubectl apply -f azure-pvc.yaml -n hcce`

- Adjust these parts of the configuration in `hcce.yam` to map the volumes of recticulum and postgresdb to the PVC:

```yaml

#for recticulum
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reticulum
...
  template:
    metadata:
      labels:
        app: reticulum
    spec:
      volumes:
      - name: storage

#       REPLACE THESE LINES:
        hostPath:
            path: /tmp/ret_storage_data
            type: DirectoryOrCreate
#       WITH THESE:
        persistentVolumeClaim:
          claimName: example-pvc


      - name: config
        configMap:
          name: ret-config

... 
#and further down for postrgresql
...
          volumeMounts:
            - name: postgresql-data
              mountPath: /var/lib/postgresql/data

#             ADD THIS LINE:
              subPath: postgres

        volumes:
        - name: postgresql-data

#       REPLACE THESE LINES:
          hostPath:
            path: /tmp/pgsql_data
#       WITH THESE:
          persistentVolumeClaim:
            claimName: imedu-disk           
```

- We use the subPath for the Postgresql volume, because postgresql likes to start in an empty folder (<https://stackoverflow.com/questions/51168558/how-to-mount-a-postgresql-volume-using-aws-ebs-in-kubernete>)
- Update your cluster by running the render and apply scripts `bash render_hcce.sh && kubectl apply -f hcce.yaml` (note: only changed items will be recreated)

- You should now see your persistent storage in the Azure portal, under `Kubernetes service`  > `Storage`

## Open ports for the Dialog server (audio/speech)

>todo: this is not working yet....

More info about networking: <https://learn.microsoft.com/en-us/azure/aks/concepts-network>
Kubenet

To make sure our dialog server works, we need to create a few inbound network security group (NSG) rules for our Azure Kubernetes Service (AKS) cluster. These will open the TCP ports 4443, 5349, and UDP ports 35000-60000 on our cluster.
See: <https://discord.com/channels/498741086295031808/1179831347984998411/1182434406015701063>

- In Azure portal, go to your AKS cluster
- On the 'properties' page, find your 'Infrastructure resource group', and click on it to open
- In the list of Resources, find the Network security group
- Click on 'inbound security rules' in the menu pane on the left
- If the port is already present, check the settings. If not click on 'Add' to add new rules 
- Use these settings:
  - Source: IP addresses
  - Source IP addresses: 0.0.0.0/0
  - Source port ranges: *
  - Destination: IP address
  - Destination IP adddress/CIDR: the public IP address of your cluster (see above: `Connect your domain to Hubs CE`)
  - Destination port ranges: 4443
  - Protocol: TCP
  - Action: Allow
  - Priority: Use the default (note that lower numbers will be prioritized)
  - Name & description: a clear recognizable name/description for this port setting
- Do the same for port range 5349 with TCP, and port range 35000-60000 for UDP

Next steps, to research:

- Try with Azure CNI network configuration

- Debug WebRTC connections of your browser: chrome://webrtc-internals/
Test STUN/TRUN <https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/>
<https://ourcodeworld.com/articles/read/1526/how-to-test-online-whether-a-stun-turn-server-is-working-properly-or-not>

- WebRTC via Kubernetes/Ingress is hard , <https://github.com/l7mp/stunner>
Seems like hubs is forcing overt TCP which is not recommended?

## Setup container registry for custom client code

To use a custom client you need to store the docker image somewhere. We use the Azure Container Registry for this, so everything is in one place.

The following things need to happen:

- We need to create a container registry service on Azure
- The Kubernetes cluster needs to have 'pull' rights from the registry
- We need access from the command line to push/pull our custom client code

### Create the Azure Container Registry service

Azure offers it's own container registry service that is compatible with docker commands. For more info:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro>

You can set it up via the Azure portal, as follows:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal?tabs=azure-cli>

### Give our Kubernetes cluster rights to pull from the registry

Here we can leverage the managed identity that is automatically created for the Kubernetes cluster (as it is for every Azure entity).

- Go to Access Control (IAM) in the Azure Container Registry
- Add a new role assignment
- Choose the role 'AcrPull'
- Assign it to a 'Managed identity', and under 'Select members', select your Kubernetes cluster.
- Store changes

### Allow command line access to push/pull our custom code

See <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli?tabs=azure-cli>

When you try to login with your admin account, this won't be allowed as it doesn't have access to the ACR by default. Theoretically you could allow this, but this is not recommened as the admin account obviously has too much rights.

The recommended way is to set up an Entra app (similar to how we provided access to the SMTP service), give that the rights to push/pull to the registry, and use the credentials from the Entra app to login with our docker client.

- In Azure portal, go to Microsoft Entra ID
- Go to 'App registrations'
- Click 'New registration' and create your app (leave default settings)
- When your app has been created, open it and go to 'Certificates and secrets'
- Create a new 'client secret', this will create a password that you will need later. Make sure to store it somewhere safe, as it will only be visible just after you created it.

Now we need to give this new service principal access to the Azure Container Registry.

- Go to Access Control (IAM) in the Azure Container Registry
- Add a new role assignment
- Choose the role 'AcrPush'
- Assign it to the service principal of the Entra app you just created
- Store changes
- Add a similor role assignement for 'AcrPull' rights

Once done, you can use the appID and password of the (Entra app's) to login from your docker client:

```bash
docker login <acr-name>.azurecr.io --username <appId> --password <password>
```

## Deploy custom client

>todo: this is not complete yet, these are some tips I found elsewhere, and needs to be checked.

- Check hcce.yaml for the reference to the container image. By default it is called : `mozillareality/hubs:stable-latest`
- Create your own docker image from your custom client
- Set up an Azure registry (Azure Container Registry)
- Upload your custom client image
- Change the container reference to use your custom client image

```text
1) create a new ECR repository, private, get the URL
2) in the hubs client directory, (assuming you have docker desktop installed already) rename or copy RetPageOriginDockerfile to just Dockerfile, and run 
docker build -t <your_project_name> .
3) run docker tag <your_project_name:tag> <your_ecr_repo_url:tag>
4) run docker push <your_ecr_repo_url:tag>
5) in my values.yaml at the top of the helm charts, change 
  repository: mozillareality/hubs
  to
  repository: <your_ecr_url>
  and change tag:  to your tag
6) run helm upgrade moz . --namespace=hcce --debug
7) and then I have had to manually delete the old hubs pod for some reason:
kubectl delete pod <pod_name>


Heh, a tip for anyone else who finds themself in dependency hell trying to make their custom client work: in the Dockerfile, where it does this:

run npm run build 1> /dev/null

you can remove that 1> /dev/null to actually see the logs


Whew, I am happy to report that this round of dependency hell seems to be over, and I have an at least marginally working custom client! A couple of notes:

Probably not relevant to most people, but I was making use of the ChatToolbarButtonContainer and AudioPopoverContainer components, and both those seem to be gone in the current master build.

Not sure what caused this second one to come up, but I got the following error:

ERROR in ./node_modules/fs-extra/lib/remove/rimraf.js 5:15-32
  Module not found: Error: Can't resolve 'assert' in '/node_modules/fs-extra/lib/remove'

The fix for it turned out to be adding the following line to the dockerfile, somewhere after "npm ci" and before "npm build":

npm install assert 

```

## Migrate data

> Todo: also some random notes, not finished yet.

See: <https://github.com/hubs-community> and then: <https://github.com/hubs-community/import_assets>

## Other info for deploying custom client

Hey CE builders, I wanted to quickly point out that I am working on a tutorial for how to deploy code like the Hubs team does using docker images and github actions. I'll list the steps here in case anyone wants to test while I write up more formal documentation:

Create a docker hub account and, optionally, a registry for your image: <https://hub.docker.com/>
Fork hubs: <https://github.com/mozilla/hubs>
Using the master branch as a starting point for adding your customizations.
When you are ready to deploy, go to .github/workflows/ and add a file called ce-build.yml and populate with the following code created by @BrandonP: <https://github.com/mikemorran/hubs/blob/master/.github/workflows/ce-build.yml>
Navigate to the "Actions" section of your repo. After adding and committing ce-build.yml, you should see "ce" listed as an action.
Go to the "Settings" tab of your repo, select "Secrets and Variables" and "Actions". Create a new repository secret titled DOCKER_HUB_PWD. In the secret value, either A. put your docker password or B. create an access token in docker hub and use the password from that.
After saving the secret, go back to the "Actions" tab, select "ce" and select "Run Workflow." In the pop-up, choose your branch, leave codepath section blank, enter your docker username, make sure the dockerfile is RetPageOriginDockerfile, and enter your registry.
Wait for build to complete successfully. You can check the successful deployment in docker hub.
Adjust your CE deployment of hubs. In lens, I do this by going to "Deployments", select "Hubs", and click the pencil button to edit. Around line 185, Instead of pointing to mozillareality/hubs:stable-latest, point to your docker image with the deployed code. You may need to add the tag number of the latest deployment.

# Tips & problem solving

## Solve 'Server lacks JWT secret'

_Link to issue: <https://github.com/mozilla/hubs-cloud/issues/325>_
If you get an error like this when entering a room:

```javascript
Peer.js:333 Uncaught (in promise) Error: JsonWebTokenError: invalid signature at e.exports._handleResponse (Peer.js:333:18) at e.exports.<anonymous> (Peer.js:265:10) (...)
```

Then something went wrong with creating your keys during installation, (like on a Mac and/or with a wrong openssl verion).

Some tips/solutions from agriggs on the hubs community discord:

```text
<https://discord.com/channels/498741086295031808/1158476691384062012/1186440102885470340>
agriggs — Yesterday at 10:41 PM
thats a bad private key (perms_key) iirc
it has to have \\n not \n

its in the output from the render_hcce.yaml file. if you exec into your ret pod and cat config.toml youll see the perms_keys in there look at the private key if you see \n it needs to be escaped
```
This works. See this thread for the full discussion; <https://discord.com/channels/498741086295031808/1175215565456019467>

## Stable deploy using a dedicated docker container
From the same discussion: use this smart docker image to create valid yaml files using the right openssl version:

```text
<https://discord.com/channels/498741086295031808/1175215565456019467/1175518684953981018>
agriggs — 11/18/2023 8:31 PM
I just wrote this dockerfile to make this easier so no dependencies need to be installed 😄

-----
from ubuntu:22.04

RUN apt update && apt upgrade -y
RUN apt install -y openssl npm gettext-base
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN chmod +x /app/render_hcce.sh

RUN npm install pem-jwk -g

CMD [ "/bin/bash", "-c", "/app/render_hcce.sh" ]
----

place in root of community edition then run
docker build . -t hubs-ce-builder:latest
then
docker run --rm -it -v REPLACE_PATH:/app hubs-ce-builder:latest
to build the yaml files 😄
```

> Important: Make sure to remove ALL pods after relaunching (not sure that all are needed maybe only recticulum, but this worked for me) with `kubectl delete --all pods --namespace=hcce`. Note that this will also delete any accounts or data unless you have implemented persistent storage.

## How to check secrets and logs in Azure portal

Secrets are stored in the Kubernetes service 'Configuration' panel

- Click on your Kubernetes service
- Go to `Configuration`
- Open the tab `Secrets`

For viewing the logs, you can find that by browsing to the pods in the Azure portal:

- Click on your Kubernetes service
- Go to `Node pools` > Select a node pools > Open the  `Nodes`
- Click on a Node > Open `Pods`  > Select a Pod
- Click on `Live logs` in the left menu to see the logs.

## How to remove your deployment without removing the cluster

`kubectl delete -f path/to/yaml -n hcce`

## DNS issues

- Don't forget this tool to debug your DNS configs: <https://mxtoolbox.com/dkim.aspx>

- Also check your DNS providers help sections. Sometimes they require an extra 'dot' in value fields, or have other ways to use domains or subdomains in name fields.

## Important notes:

- Obvious but: deleting all pods will delete scenes, avatars, and users accounts.
