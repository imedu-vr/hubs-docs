*Disclaimer: this is work in progress, and are more 'installation notes' then a full manual.*

_TODO_
- Attach static storage for recticulum: <https://learn.microsoft.com/en-us/azure/aks/concepts-storage>
- Use a static database: ??

# Installation process

>Tip: first read the whole manual before starting. Also read the specific Hubs manual (under Deploy hubs), to see which domains and other settings you need. Finally, make sure you now how to set DNS records for your DNS provider. They might require slightly different ways to add the names or values you need to enter for SPF or DKIM.

## Install Azure CLI tools

<https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew>

## Install kubectl
```
brew install kubectl
brew install Azure/kubelogin/kubelogin 
```
(see <https://azure.github.io/kubelogin/install.html> )


## Create a Kubernetes cluster

- Create Kubernetes cluster using the Azure portal 
    - Go to Kubernetes service and click 'Create'
    - Create a new resource group 
    > note: you can't change this afterwards! If you made a mistake, you may try to create a new resource group, and move the resouces in the group, but that doesn't always work)
    - Cluster preset configuration:
        - For dev use the dev/test profile
        - For production use Production ('Standard' or 'Economy' for free/cost-saving option)

            >Note: if you use Azure AD authentication with Azure RBAC , see the next paragraph to add the appropriate roles

    - Enter a cluster name (note: you can't change this afterwards! )

## Create access for user when using Azure RBAC (not tested yet!)
(This step can be skipped if you are using Local accounts with kubernetes RBAC)
See this manual for detailed steps => <https://learn.microsoft.com/en-us/azure/aks/manage-azure-rbac#create-role-assignments-for-users-to-access-cluster>

- Go to the new Resource group in Azure portal
- Go to the IAM section
- Add a role assigment for K8 (Use 'Admin Cluster') and include your user as 'member' of the role assignment

## Setup domain + Email  server
Use an external DNS provider to buy the domain, adjust the DNS settings and request the certificates (or use Azure Hosted Zones, which I don't know about)

To set up an SMTP service, follow this tutorial:  <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email-smtp/send-email-smtp?pivots=smtp-method-smtpclient> Basically you need an Azure Communication service to serve as an SMTP service. This uses the Azure Email Communication Service to send emails, and uses an Entry app for authentication.

- Setup an Email Communication service, and connect it to a new Azure Communication service.
- Then create an Entra app which will be used to authenticate to the SMTP (see doc)
>Important! Make sure to add noreply@<yourdomain> as a verified Sender address in the Email Communication Service, otherwise you will see errors in the recticulum logs, saying 'Email sender address not allowed' and no login mails will be sent.

## How to open a CLI to your cluster:
- Find you cluster in the portal (Kubernetes services)
- Click on 'connect' and follow the instructions in a terminal, to connect to your cluster on the command line

## Deploy hubs
Read this manual for detailed steps => <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>

- Clone the hubs repo
- Go to the /community-edition directory
- Connect to your cluster (see above)
- Change the setup values in the installation script `render_hcce_sh`
- Follow the instructions and run : `bash render_hcce.sh && kubectl apply -f hcce.yaml` 
>Tip: use a docker image to avoid issues with local versions of openssl, see 'Use Docker image to deploy' below
- Make sure to check the ouput logs, you are problably missing an NPM package (pem-jwk) . Install it using the instructions given (this is already included in the Docker image)

## Connect your domain
- To find public IP on Azure, call `kubectl -n hcce get svc lb`  (the namespace name can be found in the portal)
- Set the DNS entries for &lt;your-domain&gt;, assets.&lt;domain&gt;, stream.&lt;domain&gt; and cors.&lt;domain&gt; to the public IP of the cluster

**You should now be able to access your cluster (with bypassing the warning for self-signed certificates)!**

## Set up your certs
You could try installing the certificates with certobot (see <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/>), but this didn't work for me. It kept provisioning 'self-signed certificates'

To install your own certs, you need to update them in the Azure secrets for you main domain and the assets, cors, stream subdomains
- To list all secrets: `kubectl get secrets -n hcce`
You will see something like this:

```
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
```
kubectl delete secret cert-<your-domain> -n hcce
kubectl create secret tls cert-<your-domain> -n hcce --cert=backup-certs/certificate.pem --key=backup-certs/key.pem
```
- Make sure to build your certificate.pem with the domain certificate _on top_ and paste the cabundle below that.
- If you already visited your cluster, it might take a while before the cached self-signed certificates are updated. You could check the validity of your new certificates at e.g. https://stream.<your-domain> as that might not have been cached yet.

# Tips & resolving errors

## Use Docker image to deploy (and Solve 'Server lacks JWT secret')
If you get an error like this when entering a room:
```
Peer.js:333 Uncaught (in promise) Error: JsonWebTokenError: invalid signature at e.exports._handleResponse (Peer.js:333:18) at e.exports.<anonymous> (Peer.js:265:10) (...)
```
then something went wrong with creating your keys during installation, (like on a Mac and/or with a wrong openssl verion).

Some great tips/solutions from agriggs on the hubs community discord:
```
<https://discord.com/channels/498741086295031808/1158476691384062012/1186440102885470340>
agriggs — Yesterday at 10:41 PM
thats a bad private key (perms_key) iirc
it has to have \\n not \n

its in the output from the render_hcce.yaml file. if you exec into your ret pod and cat config.toml youll see the perms_keys in there look at the private key if you see \n it needs to be escaped
```

See this thread for the full discussion; <https://discord.com/channels/498741086295031808/1175215565456019467>

### Suggested solution
From the same discussion: use this smart docker image to create valid yaml files using the right openssl version:
```
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
> Important: Make sure to remove ALL pods after relaunching (not sure that all are needed, but that worked for me)

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

## DNS issues
- Don't forget this tool to debug your DNS configs: <https://mxtoolbox.com/dkim.aspx>
- Also check your DNS providers help sections. Sometimes they require an extra 'dot' in value fields, or have other ways to use domains or subdomains in name fields.

## Important notes:
- Obvious but: deleting all pods will delete scenes, avatars, and users accounts.
