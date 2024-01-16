
# Remaining issues / todo

Note: some parts of this document are still under investigation, but you can use it to set up a working Hubs CE edition with persistent storage on Azure.

* Test instructions for custom client

* Add solution for data migration from Hubs Cloud

* Check video support now support for Youtube video seems to be removed (ytll).
<https://discord.com/channels/498741086295031808/819188464145924117/1186738741755256942>

* Still showing 404s on some files from https://assets.yourdomain when opening Spoke (e.g. the spoke logo)

* For production: consider to use a seperate database service, instead of persistent storage?

---

# Contents

* Preparations & important concepts

* Installation

  * Install command line tools

  * Create a Kubernetes cluster

  * Setup your domain + email service

  * Access your cluster

  * Deploy Hubs CE

  * Connect your domain to Hubs CE

  * Set up your certificates

  * Add persistent storage for files and database

  * Setup container registry for custom client code

  * Deploy custom client

* Tips & problem solving

# Preparations & important concepts

This installation manual for Hubs Community Edition on Azure was based on community edition status of Dec 18 2023, and includes some tips from the Hubs community. Disclaimer: I'm not an expert on Azure, so their might be betters ways to do this.

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

Besides the system assigned managed identities, you can assign 'custom' managed identities as a user. These can be created as much as you liked, and can also be used in role based assignments. By default these identities are not linked to a service, but you can do that by going to the 'Identity' page under a service. Here you can add alternative identites for the service.

#### Authenticate as a service principal using Entra ID applications

Finally, there are registered applications in Azure Active Directory ('Microsoft Entra ID'). These provide authentication and authorization services for applications. When you register an app in Microsoft Entra ID it also creates a service principal in the backend, that you can use in the same way for role-based access. Besides that, you can also generate credentials, so you can authenticate as that servivce principal from an external system.

For a good introduction + video, see: <https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview>

# Installation process

## Install command line tools

Open a terminal to install the required command-line tools to access Azure and control your Kubernetes cluster.

* Follow these instruction to install Azure CLI tools <https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew>

* Install kubectl with the following commands

```bash
brew install kubectl
brew install Azure/kubelogin/kubelogin 
```

(see <https://azure.github.io/kubelogin/install.html> )

## Create a Kubernetes cluster

Although you might find it easier to create a cluster using the portal UI, we use the CLI here because we can't find a way to set the --enable-node-public_ip through the portal interface

1) First we create a new resource group for our cluster

```bash
az group create --name <resource group name> --location <location eg. 'westeurope'>
```

2) Then we create the cluster. This command creates a simple cluster for testing/development purposes. For a production environment you might want to consider to set more options like a 'prodcution preset configuration' and a more secure network type or policy. See: <https://learn.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-cli>

```bash
az aks create -g <resource group name> -n <cluster name> -l <location eg. 'westeurope'>  --enable-node-public-ip
```

__Important: the '--enable node public ip' option is essential as it will configure the VMSS to assign public IP addresses to your nodes. If left out, your coturn/dialog services will not work while they need a public IP to set up a WebRTC connection. More info here: <https://learn.microsoft.com/en-us/azure/aks/use-node-public-ips>__

> In Azure, nodes are managed through a Virtual Machine Scale Set (<https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview>), which is an autoscaling container for Virtual Machines (like nodes in your cluster). This concept is not part of Kubernetes, so you need to configure this seperately in Azure.

Some thoughts about more advanced setup:

* How you want to authorize and authenticate depends on how you want to manage accounts and access across your Azure enviroment. The default setting 'Local accounts with Kubernetes RBAC' should be ok for your (first) installation, but you can also use Active Directory to control your accounts and optionally control role based access.

* If you need/want to change the VM size for your node pool, DS2_v2 sounds like a good start as it has a similar number of cores and more memory then AWS EC2 C4 large (which was always recommended by Hubs to choose). However, this is purely based on specs and might need some further monitoring and investigation.

### Create access for user when using Azure RBAC (not tested yet!)

This step can be skipped if you are using Local accounts with kubernetes RBAC.

See this manual for detailed steps => <https://learn.microsoft.com/en-us/azure/aks/manage-azure-rbac#create-role-assignments-for-users-to-access-cluster>

1) Go to the new Resource group in Azure portal

2) Go to the IAM section

3) Add a role assigment for K8 (Use 'Admin Cluster') and include your user as 'member' of the role assignment

## Setup your domain + email service

Use an external DNS provider to buy the domain and optionally buy/request a wildcard certificate (see below 'Connect your domain'). Or you should be able to (partially) use Azure Hosted Zones for this, which I don't know about so I can't elaborate about that.

To set up an SMTP service, follow these steps:

1) Set up an Azure Communication service to serve as an SMTP service. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/create-email-communication-resource>

2) Set up an active Azure Email Communication Services Resource connected with Email Domain and a Connection String. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/connect-email-communication-resource>.

3) Set up a new Entra app with rights to write/send emails, and provide SMTP access via an Entra app that has access to the Azure Communication Service. Leveraging the service principal of an Entra app (and not just a user managed identity) is apparently how Azure implements SMTP credentials. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication>

__Important! Make sure to add noreply@\<yourdomain\> as a verified Sender address in the Email Communication Service. Open your domain under 'Provision domains' and click 'MailFrom addresses' to add it. Otherwise you will see errors in the reticulum  logs, saying 'Email sender address not allowed' and no login mails will be sent__

## Access your cluster

1) Find you cluster in the portal (Kubernetes services)

2) Click on 'connect' and follow the instructions in a terminal, to connect to your cluster on the command line

## Deploy Hubs CE

1) Read this manual for detailed steps => <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>

2) Clone the hubs repo

3) Go to the /community-edition directory

4) Connect to your cluster (see above)

5) Change the setup values in the installation script `render_hcce_sh`

6) Follow the instructions and run : `bash render_hcce.sh && kubectl apply -f hcce.yaml`

>Tip: use a docker image to avoid issues with local versions of openssl, see 'Use Docker image to deploy' below

__Important: Make sure to check the ouput logs, you are problably missing an NPM package (pem-jwk) . Install it using the instructions given (this is already included in the Docker image)__

## Connect your domain to Hubs CE

1) To find the public IP of your Kubernetes cluster on Azure, call:

```bash
kubectl -n hcce get svc lb
```

The namespace (by default 'hcce'), was set during deployment and can be found in the yaml file or portal.

Alternatively you can go to `Serices and ingresses` under you Kubernetes service in the Azure portal, and look for the `External IP` for the loadbalancer service (`lb`)

2) Set the DNS entries for `<your-domain>`, `assets.<domain>`, `stream.<domain>` and `cors.<domain>` to the public IP of the cluster

**You should now be able to access your cluster (with bypassing the warning for self-signed certificates)!**

## Set up your certificates

### Use certobot

You could try installing the certificates with certobot (see <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>), but this didn't work for me. It kept provisioning 'self-signed certificates'

### Use a custom certificate

To install your own certificates, you need to update the respective Azure secrets for you main domain and the assets, cors, stream subdomains

1) To list all secrets: `kubectl get secrets -n hcce`

You will see something like this:

```bash
# We leave this alone
cert-hcce                   kubernetes.io/tls   2      40h
configs                     Opaque              20     40h

# This might be present or not, but we are going to add/replace this anyway
cert-assets.<your domain>   kubernetes.io/tls   2      36h
cert-cors.<your domain>     kubernetes.io/tls   2      36h
cert-<your domain>          kubernetes.io/tls   2      36h
cert-stream.<your domain>   kubernetes.io/tls   2      36h

```

2) The bottom part show all secrets we need to set up or add (if they aren't there). Note while tls secrets are immutable, you can't edit existing secrets unfortunately, and you might need to remove existing secrets first like this:

```bash
kubectl delete secret cert-<your-domain> -n hcce
```

3) Then (re)create the secret it with the same name and as content your own certificates.

```bash
kubectl create secret tls cert-<your-domain> -n hcce --cert=path_to_certs/certificate.pem --key=path_to_certs/key.pem
```

Some things to check:

* Don't forget to create them in the right namespace, in this case `hcce`. 

* If you want to create a backup of the existing certs before you delete them (not sure why but it might feel safe), this can be done by using the portal to view the contents of the secrets as explained further below

* Make sure to build your certificate.pem with the domain certificate _on top_ and paste the cabundle below that.

* If you already visited your cluster, it might take a while before the cached self-signed certificates are updated. You could check the validity of your new certificates at e.g. https://stream.\<your-domain\> as that might not have been cached yet in your network.

### Adjust kubernetes configuration to make sure your main domain certificate is working

In Azure I had to make the following change, to ensure the main certificate was working: change the default-ssl-certificate in the haproxy config (in hcce.yaml) to point to your main domain certificate secret

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


By default the Hubs CE configuration uses the local storage of the pods to store the pgsql database and reticulum files. However, these volumes on pods are ephemeral, which results in data-loss when deleting a pod. 

To work around that we need to connect our volumes to a persistent storage solution. See this article for more details about (persistant) storage in Azure Kubernetes Services: <https://learn.microsoft.com/en-us/azure/aks/concepts-storage>. To set up our  dynamic persistant volumes, we used these instructions <https://learn.microsoft.com/en-us/azure/aks/azure-csi-files-storage-provision>

__Important: Applying this step will remove existing accounts and content as it moves the storage location of files and database. Make sure to test this well before you start actively using your cluster. With this setup you should be able to safely delete all pods without losing data.__

### Setting up your storage account

The cluster contains a reticulum  server and a postgress DB, which both store their data on disk. In these steps we are moving this storage to a persistent Azure Disk. The steps are as follows:

1) Go to 'Storage Account and click on `Create`

2) Fill in the form to create a new storage account, use default settings where given

* On the 'Networking' tab, set the `network access` to Enable public access from selected virtual networks and IP addresses. 
* In the configuration field, choose the Virtual Network in which your cluster is installed. This should block public access.

3) Finish the process and create your storage account

### Create a persistent volume claim

We need to add a `Persistent Volume Claim` to our cluster, to which we can connect our reticulum  storage. Note that this will automatically create a `Persistent volume`, based on the given (default) Storage Class. Once we created this, we can change the reticulum  and postgresdb config in `hcce.yaml` to use this new persistent storage. For details see: <https://learn.microsoft.com/en-us/azure/aks/azure-csi-disk-storage-provision>

1) Create and adjust the following azure-pvc.yaml file to create the your PVC's. We use seperate PVC's here for reticulum (files) and the Postgress database, although you could also use the same:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-disk-reticulum 
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: default
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-disk-pgql
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: default
  resources:
    requests:
      storage: 10Gi
```

2) Apply the configuration to your cluster with `kubectl apply -f azure-pvc.yaml -n hcce`

3) Adjust these parts of the configuration in `hcce.yam` to map the volumes of reticulum  and postgresdb to the PVC's:

```yaml

#for reticulum 
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

#--     REPLACE THESE LINES:
        hostPath:
            path: /tmp/ret_storage_data
            type: DirectoryOrCreate
#--
#       WITH THESE:
        persistentVolumeClaim:
          claimName: pvc-disk-reticulum 

      - name: config
        configMap:
          name: ret-config

... 
#and further down for postrgresql
...
          volumeMounts:
            - name: postgresql-data
              mountPath: /var/lib/postgresql/data

#--           ADD THIS LINE:
              subPath: postgres
#--
        volumes:
        - name: postgresql-data

#--     REPLACE THESE LINES:
          hostPath:
            path: /tmp/pgsql_data
#--
#--     WITH THESE:
          persistentVolumeClaim:
            claimName: pvc-disk-pgql      
#--
```

4) We add a `subPath` for the Postgresql volume because postgresql likes to start in an empty folder (<https://stackoverflow.com/questions/51168558/how-to-mount-a-postgresql-volume-using-aws-ebs-in-kubernete>)

5) Update your cluster by running the render and apply scripts `bash render_hcce.sh && kubectl apply -f hcce.yaml` (note: this will only apply the changes)

6) You should now have persistent storage. You can find it in the Azure portal, under `Kubernetes service`  > `Storage`

Some thoughts / things to consider:

* For production it is better to consider to use an external database service. Then is easier to scale and you can leverage tools like backup and restore

* It depends a bit on our setup, but when we share a disk for multiple pods, one pod might be on a different node then the other. Secondly, we've seen when deleting a pod the new pod can't claim the connection while the old one is not released in time. Not sure if this was due to another error, but needs to be monitored

* A more stable solution could be to use persistent volume claims that are open to multiple connections, however not all storage classes support ReadWriteMany, so it can be a bit tricky to set up a working storage class. Also, you need to explicitely activate 'shared' connections on the storage class, before you can create a persistent volumen claim for the class that has policy 'ReadWriteMany'.

## Open ports for the Dialog server (audio/speech)

To make sure our dialog server works, we need to create a few inbound network security group (NSG) rules for our Azure Kubernetes Service (AKS) cluster. These will open the TCP ports 4443, 5349, and UDP ports 35000-60000 on our cluster.
See: <https://discord.com/channels/498741086295031808/1179831347984998411/1182434406015701063>

1) In Azure portal, go to your AKS cluster
2) On the 'properties' page, find your 'Infrastructure resource group', and click on it to open
3) In the list of Resources, find the Network security group
4) Click on 'inbound security rules' in the menu pane on the left
5) If the port is already present, check the settings. If not click on 'Add' to add new rules
6) Use these settings:
  * Source: IP addresses
  * Source IP addresses: 0.0.0.0/0
  * Source port ranges: *
  * Destination: IP address
  * Destination IP adddress/CIDR: the public IP address of your cluster (see above: `Connect your domain to Hubs CE`)
  * Destination port ranges: 4443
  * Protocol: TCP
  * Action: Allow
  * Priority: Use the default (note that lower numbers will be prioritized)
  * Name & description: a clear recognizable name/description for this port setting
7) Do the same for port range 5349 with TCP, and port range 35000-60000 for UDP

## Setup container registry for custom client code

To use a custom client you need to store the docker image somewhere. We use the Azure Container Registry for this so everything is in one place. The following things need to happen:

* We need to create a container registry service on Azure
* The Kubernetes cluster needs to have 'pull' rights from the registry
* We need access from the command line to push/pull our custom client code

### Create the Azure Container Registry service

Azure offers it's own container registry service that is compatible with docker commands. For more info:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro>

You can set it up via the Azure portal, as follows:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal?tabs=azure-cli>

### Give our Kubernetes cluster rights to pull from the registry

Here we can leverage the managed identity that is automatically created for the Kubernetes cluster (as it is for every Azure entity).

1) Go to Access Control (IAM) in the Azure Container Registry
2) Add a new role assignment
3) Choose the role 'AcrPull'
4) Assign it to a 'Managed identity', and under 'Select members', select your Kubernetes cluster.
5) Store changes

### Allow command line access to push/pull our custom code

See <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli?tabs=azure-cli>

When you try to login with your admin account, this won't be allowed as it doesn't have access to the ACR by default. Theoretically you could allow this, but this is not recommened as the admin account obviously has too much rights.

The recommended way is to set up an Entra app (similar to how we provided access to the SMTP service), give that rights to push/pull to the registry, and use the credentials from the Entra app to login with our docker client.

1) In Azure portal, go to Microsoft Entra ID
2) Go to 'App registrations'
3) Click 'New registration' and create your app (leave default settings)
4) When your app has been created, open it and go to 'Certificates and secrets'
5) Create a new 'client secret', this will create a password that you will need later. Make sure to store it somewhere safe, as it will only be visible just after you created it.

Now we need to give this new service principal access to the Azure Container Registry.

1) Go to Access Control (IAM) in the Azure Container Registry
2) Add a new role assignment
3) Choose the role `AcrPush`
4) Assign it to the service principal of the Entra app you just created
5) Store changes
6) Add a similor role assignement for `AcrPull` rights

Once done, you can use the appID and password of the (Entra app's) to login from your docker client:

```bash
docker login <acr-name>.azurecr.io --username <appId> --password <password>
```

## Deploy custom client

>todo: this is not complete yet, these are some tips I found elsewhere, and needs to be checked.

1) In the hubs client directory, (assuming you have docker desktop installed already) rename or copy `RetPageOriginDockerfile` to `Dockerfile`

2) Build the container by running the following command from the project root:

```bash
docker build -t <acr-name>.azurecr.io/<path>/<imagename> -f ./Dockerfile .
```

If you are on a machine with an ARM chipset (eg. Apple Silicon Mx), use buildx for a multi-platform build:

```bash
docker buildx build --platform linux/amd64 -t <acr-name>.azurecr.io/<path>/<imagename> -f ./Dockerfile .
```

If you want to make sure to have a 'clean' build, you can disable all caching and force the build to pull new base images by adding the params `--no-cache --rm --pull` to the command

3) Connect to your Azure registry (see section 'Allow command line access to push/pull our custom code')

```bash
docker login <acr-name>.azurecr.io --username <appId> --password <password>
```

4) Tag and push your custom client image

By default the image will be tagged with `:latest`, you can make an alias by creating a different tag

```bash
docker tag <acr-name>.azurecr.io/<path>/<imagename> <tagname>
```

Now push it to your Azure remote registry

```bash
docker push <acr-name>.azurecr.io/<path name>/<image name>
```

5) Change the container reference to use your custom client path & image in `hcce.yam` and __rebuild you hcce.yaml__ file (see above)

```yaml
---
########################################################################
######################   hubs   ########################################
########################################################################
apiVersion: apps/v1
kind: Deployment
...
    spec:
      containers:
        - name: hubs

#---      CHANGE THIS
          image: mozillareality/hubs:stable-latest
#--

#---      INTO THIS
          image: <your acr name>.azurecr.io/<path>/<image name>:<image tag>
#--
          imagePullPolicy: IfNotPresent
          env:
...

```

Note: Kubernetes will not always pull a new image if you pushed a new version, this depends on the tag you used. If you push under the same tag, it will not pull a new image, except if the tag is `latest`, then it will always pull. See <https://www.howtogeek.com/devops/understanding-kubernetes-image-pull-policies/>

7) Update your Kubernetes cluster, and delete the hubs pod.

```bash
kubectl apply -f hcce.yaml       
kubectl delete pods -all -n hcce
```

Some notes I gathered from the community, for solving issues with (re)building your custom client:

### Not working docker file, failing to authenticate to git

In my case the docker file would not work with our custom client, due to package.json.lock was in old format, and it couldn't authenticate to git

Fixed by rebuilding package.json.lock locally first with node 16.16 and npm 8.11.0 (similar to image of Docker file), then change the Dockerfile to run `npm ci` with the `legacy-peer-deps` flag

### Debugging dependencies while building custom client container

A tip for anyone else who finds themself in dependency hell trying to make their custom client work: in the Dockerfile, where it does this:

```bash
run npm run build 1> /dev/null
```

you can remove that 1> /dev/null to actually see the logs

## Migrate data

> Todo: also some random notes, not finished yet.

See: <https://github.com/hubs-community> and then: <https://github.com/hubs-community/import_assets>

And:
<https://discord.com/channels/498741086295031808/1187869861632811038/1187870033813196821>
<https://discord.com/channels/498741086295031808/1187869861632811038/1187879001633603646>

# Tips & problem solving

## Solve 'Server lacks JWT secret'

_Link to issue: <https://github.com/mozilla/hubs-cloud/issues/325>_
If you get an error like this when entering a room:

```javascript
Peer.js:333 Uncaught (in promise) Error: JsonWebTokenError: invalid signature at e.exports._handleResponse (Peer.js:333:18) at e.exports.<anonymous> (Peer.js:265:10) (...)
```

Then something went wrong with creating your keys during installation, (like on a Mac and/or with a wrong openssl verion). The deployment script probably misencoded the private key string, as agriggs on the hubs community discord says here:

```text
<https://discord.com/channels/498741086295031808/1158476691384062012/1186440102885470340>
thats a bad private key (perms_key) iirc
it has to have \\n not \n
its in the output from the render_hcce.yaml file. if you exec into your ret pod and cat config.toml youll see the perms_keys in there look at the private key if you see \n it needs to be escaped
```

To look into the reticulum  pod, use

```bash
kubectl exec --stdin --tty <reticulum  pod name> -n hcce -- /bin/sh
more config.toml
```

See this thread for the full discussion; <https://discord.com/channels/498741086295031808/1175215565456019467>

## Audio / speech not working

This is probably an issue in your firewall or cluster configuration. For WebRTC, your nodes need to have a public accessible IP address and the firewall needs to have the respective ports open. Check the settings under 'Open ports for Dialog server', and make sure you created your cluset with 'enable-node-public-ip'

More info about networking: <https://learn.microsoft.com/en-us/azure/aks/concepts-network>

Also, some cases are reported where the coturn pod was not listening on the right IP (it should be 0.0.0.0 according to <https://discord.com/channels/498741086295031808/1189804739932721252/1195094456064548945>). This can be fixed by creating a new coturn image, or use the one from the thread.

## Pods not starting due to a problem with attaching persistent storage disk

We've encountered some problems with persistant storage volumes not being disconnected after a pod was removed. This shows up as an event for the pod that goes like: `Multi-Attach error for volume "pvc-xxxxx-xxxxx" Volume is already used by pod(s) reticulum-xxxxx-xxxxx`

The error message Multi-Attach error for volume "pvc-..." Volume is already used by pod(s)... in Azure Kubernetes Service (AKS) typically occurs when a Persistent Volume (PV) that supports only a single attachment (like Azure Disks) is still being used by another pod. This happens often when a pod is rescheduled to a different node but the volume attachment to the previous node has not been released.

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

> Important: Make sure to remove ALL pods after relaunching (not sure that all are needed maybe only reticulum , but this worked for me) with `kubectl delete --all pods --namespace=hcce`. Note that this will also delete any accounts or data unless you have implemented persistent storage.

## Restart a pod after changes

To make sure a change in your kubernetes config is applied, you are advised to delete all pods, which triggers Kubernetes to restart them with the latest settings:

```bash
kubectl delete pod <pod name> -n hcce 
```

or for all pods:

```bash
kubectl delete pods --all -n hcce 
```

Alternatively, you can also remove the deployment, which creates a more controlled situation, while it does not automatically restart the pods. Also, you can always use the simple deployment name, instead of having to look up the pod name.

```bash
kubectl delete deployment <deployment name> -n hcce 
```

To restore all services you now need to `kubectl apply` the kubernetes configuration again.

## Check a (failing) pod logs

When a pod fails to start, it might be interesting to see the previous logs. You can use the following command to do so.

```bash
kubectl logs <pod name> -n hcce --previous
```

## How to check secrets and logs in Azure portal

Secrets are stored in the Kubernetes service 'Configuration' panel

* Click on your Kubernetes service
* Go to `Configuration`
* Open the tab `Secrets`

For viewing the logs, you can find that by browsing to the pods in the Azure portal:

* Click on your Kubernetes service
* Go to `Node pools` > Select a node pools > Open the  `Nodes`
* Click on a Node > Open `Pods`  > Select a Pod
* Click on `Live logs` in the left menu to see the logs.

## How to remove your deployment without removing the cluster

`kubectl delete -f path/to/yaml -n hcce`

## DNS issues

* Don't forget this tool to debug your DNS configs: <https://mxtoolbox.com/dkim.aspx>

* Also check your DNS providers help sections. Sometimes they require an extra 'dot' in value fields, or have other ways to use domains or subdomains in name fields.

## Important notes:

* Obvious but: deleting all pods will delete scenes, avatars, and users accounts.
