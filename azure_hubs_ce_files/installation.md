Install Hubs CE on Azure Kubernetes Service

# Installation process

---

## [Index](../azure_hubs_ce_installation.md)

* [Preparations & important concepts](preparations_and_concepts.md)

* Installation (this chapter)

  * Install command line tools

  * Create a Kubernetes cluster

  * Set up a static IP address for your cluster

  * Set up an external database

  * Buy a domain
  
  * Set up email service

  * Connect to your cluster

  * Deploy Hubs CE

  * Connect your domain to Hubs CE

  * Set up your certificates

  * Add persistent storage for files and database

  * Open ports for the Dialog server (audio/speech)

  * Setup container registry for custom client code

  * Configure CORS and other 'server settings'

  * Deploy custom client

* [Migrate data](migrate_data.md)

* [Tips & problem solving](tips_and_problem_solving.md)

---

## Install command line tools

Open a terminal to install the required command-line tools to access Azure and control your Kubernetes cluster.

1) Follow these instruction to install Azure CLI tools <https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos#install-with-homebrew>

2) Install kubectl with the following commands

```bash
brew install kubectl
brew install Azure/kubelogin/kubelogin 
```

See: <https://azure.github.io/kubelogin/install.html>

## Create a Kubernetes cluster

Although you might find it easier to create a cluster using the portal UI, we use the CLI here because we can't find a way to set the `--enable-node-public_ip` through the portal interface

1) First we create a new resource group for our cluster

```bash
az group create --name <resource group name> --location <location eg. 'westeurope'>
```

2) Then we create the cluster. This command creates a simple cluster for testing/development purposes. For a production environment you might want to consider to set more options like a 'production preset configuration' and a more secure network type or policy. See: <https://learn.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-cli>

```bash
az aks create -g <resource group name> -s <CLUSTERTYPE> -n <cluster name> -l <location eg. 'westeurope'>  --enable-node-public-ip --node-count 2 --network-plugin azure
```

__Important: the '--enable node public ip' option is essential as it will configure the VMSS to assign public IP addresses to your nodes. If left out, your coturn/dialog services will not work while they need a public IP to set up a WebRTC connection. More info here: <https://learn.microsoft.com/en-us/azure/aks/use-node-public-ips>__

In case you want to connect your cluster to an Azure Container Registry, you can add the parameter `--attach-acr <acr name>` directly instead of adding it later (see 'Give our Kubernetes cluster rights to pull from the registry and create a secret' below)

### Some guidelines for choosing a clustertype

* For Personal use -> standard_f2s
* For Medium use -> standard_f4s
* For Large scale use-> standard_f8s

You can always change the nodepool configuration later, see <https://learn.microsoft.com/en-us/azure/aks/resize-node-pool?tabs=azure-cli>. If you need/want to change the VM size for your node pool you can think about F2s_v2 for personal use, F4s_v2 for medium usages, and F8s_v2 for large capacity. However, this is purely based on specs and might need some further monitoring and investigation.

The available VM sizes (products) might differ for your azure subscription and/or region. If the requested size is not available, you usually get a list of available options, or check <https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/> 

> In Azure, nodes are managed through a Virtual Machine Scale Set (<https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview>), which is an autoscaling container for Virtual Machines (like nodes in your cluster). This concept is not part of Kubernetes, so if you want to change the size of your virtual machines you need to configure this seperately in Azure.

Some thoughts about more advanced setup:

* How you want to authorize and authenticate depends on how you want to manage accounts and access across your Azure enviroment. The default setting 'Local accounts with Kubernetes RBAC' should be ok for your (first) installation, but you can also use Active Directory to control your accounts and optionally control role based access.

### Create access for user when using Azure RBAC (not tested yet!)

This step can be skipped if you are using Local accounts with kubernetes RBAC.

See this manual for detailed steps => <https://learn.microsoft.com/en-us/azure/aks/manage-azure-rbac#create-role-assignments-for-users-to-access-cluster>

1) Go to the new Resource group in Azure portal

2) Go to the IAM section

3) Add a role assigment for K8 (Use 'Admin Cluster') and include your user as 'member' of the role assignment

## Set up a static IP address for your cluster

AKS automatically creates a static public IP address for your cluster. This can be found in the automatic created cluster's resource group (starting with `MC_<your cluster name>`)

## Pausing restarting your cluster

To pause your cluster, you can scale down the deployments to 0 as follows:

```bash
kubectl scale --replicas=0 deployment --all -n hcce
```

To unpause the deployments you can do:

```bash
kubectl scale --replicas=1 deployment --all -n hcce
```

Note that this will not pause any other external services outside the cluster (eg. like an external database)


## Set up an external database

Hubs clouds comes with an included postgresql server that is run on a separate pod (behind a pgbouncer pod). For flexibility or more control you can also set up a separate database.

The most cost-efficient way is to start a VM with PostgresSQL on it. You can install it yourself, but here (as a middle of the road solution) we'll use an image from the Azure marketplace and link it to our application.

You can also use an Azure PostgreSQL service (which can even includes its one pgbouncer if you want), but this is significantly more expensive.

This can be done with the following instructions.

1. First we want to enable encryption on our host disk, so we need to enable that for our subscription (so only once!). See: <https://learn.microsoft.com/en-us/azure/virtual-machines/disks-enable-host-based-encryption-portal?tabs=azure-cli#prerequisites>

```bash
az feature register --name EncryptionAtHost  --namespace Microsoft.Compute
```

This can take a few minutes, check the status with:

```bash
az feature show --name EncryptionAtHost --namespace Microsoft.Compute
```

When state is 'Registered' run the following to propagate the change

```bash
az provider register -n Microsoft.Compute
```

2. To create our server, go to the portal and select 'Create a service'. Find a postgres server, eg. the `PostgreSQL Server and pgAdmin on Ubuntu Server 20.04` image (from Cloud Infrastructure Services, under Microsoft Standard Contract).

3. Install the VM in THE SAME resource group, virtual network and security group as your cluster.

4. Choose an appropriate VM size, and install the VM. For a small production database or test situation Bs v2-series might already be sufficient.

5. When your installation in finished, log in to the VM  and set up postgreSQL.

You may need to add a (temporary) inbound security rule to allow ssh (for 'Source' choose 'My IP, for 'Destination', choose 'any'). Then follow these instructions to set up the postgres server: <https://cloudinfrastructureservices.co.uk/how-to-setup-install-postgresql-server-on-azure-aws-gcp>

In short, the steps are:

a) Create a system user called 'postgres' (this is important as it is used in the cluster configuration)

```bash
sudo usermod -aG sudo postgres
sudo passwd postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'a very strong password';"
```

b) Log in to postgres shell and create an empty database called `retdb`

```bash
sudo su -l postgres
psql
CREATE DATABASE retdb;
```

c) let postgres accept external access

```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
# ==> Enable 'listen_addresses' directive, and set to '*'

sudo nano /etc/postgresql/12/main/pg_hba.conf
# ==> Add the following line at the bottom: host all all 0.0.0.0/0 md5
# ==> You can replace 0.0.0.0/0 with a subnet for more security

# restart the DB server
sudo systemctl restart postgresql
```

* To make sure you can access the database open up port 5432, 80 and 443 in your inbound security group rules in Azure. You can restrict to the subnet of the cluster and/or include any other systems that you want to have access from.

* Todo: Not 100% sure, but you may also need to open up port 5432 outbound, in case you want to access your server remotely with e.g. PGADMIN.

* Test access to your database with pgAdmin or similar tool. You will need to (temporarily) configure inbound access from your system.

Now your database is working, we need to connect the cluster to it:

6. Open your `render_hcce.sh` and change the following variable declarations:

```bash
export DB_PASS=<the password of your postgres admin user>
export DB_HOST="<INTERNAL ip of your custom postgresql server>"
export DB_HOST_T="<INTERNAL ip of your custom postgresql server>"
export PGRST_DB_URI="postgres://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME"
export PSQL="postgres://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME"
```

7. Rebuild your .yaml files and apply it to the cluster

When all is done, you can remove any unnecessary inbound firewalls rules.

> Note: we bypass pgbouncer here as it was included to deal with AWS cloud databases. If we want to keep using it , we could try to keep the pod and connect it to the external database, or (maybe better) install pgbouncer on our VM. Azure Postrgresql should come with pgbouncer include, which might be a good solution for production.

## Buy a domain

Use an external DNS provider to buy the domain and optionally buy an SSL certificate, I would advice to use a wildcard as you also need to secure several subdomains. 

> You should also be able to (partially) use Azure Hosted Zones for this, which I don't know about so I can't elaborate about that.

## Set up an email service

In order to authenticate on our cluster we need an SMTP service. Ofcourse you can use any other SMTP service, but as we like to have everything in the same place we are going to install and use an SMTP service from Azure.

To set this up, follow these steps:

1) Set up an Azure Communication service to serve as an SMTP service. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/create-email-communication-resource>

2) Set up an active Azure Email Communication Services Resource connected with Email Domain and a Connection String. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/connect-email-communication-resource>.

3) Set up a new Entra app with rights to write/send emails, and provide SMTP access via an Entra app that has access to the Azure Communication Service. Leveraging the service principal of an Entra app (and not just a user managed identity) is apparently how Azure implements SMTP credentials. <https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication>

__Important! Make sure to add noreply@\<yourdomain\> as a verified Sender address in the Email Communication Service. Open your domain under 'Provision domains' and click 'MailFrom addresses' to add it. Otherwise you will see errors in the reticulum  logs, saying 'Email sender address not allowed' and no login mails will be sent__

## Connect to your cluster

Now your cluster is ready, and you have an email service, we can start to deploy Hubs CE. To do that we first need access to the cluster from the command line.

1) Find you cluster in the portal (Kubernetes services)

2) On the overview page, click on 'connect' in the top navigation bar, and follow the instructions in a terminal, to connect to your cluster on the command line

## Add persistent storage for files (and/or database pods)

By default the Hubs CE configuration uses the local storage of the pods to store the pgsql database and reticulum files. However, these volumes on pods are ephemeral, which results in data-loss when deleting a pod.

To work around that we need to connect our volumes to a persistent storage solution, and change that in our hcce.yaml file. See this article for more details about (persistant) storage in Azure Kubernetes Services: <https://learn.microsoft.com/en-us/azure/aks/concepts-storage>. To set up our  dynamic persistant volumes, we used these instructions <https://learn.microsoft.com/en-us/azure/aks/azure-csi-files-storage-provision>

> Obviously, if you are using a seperate PSQL database server you only have to add the persistent storage for the reticulum storage. But let's discuss both.

__Important: Applying this step will remove existing accounts and content as it moves the storage location of files and database. Make sure to test this well before you start actively using your cluster. With this setup you should be able to safely delete all pods without losing data.__

### Setting up your storage account

The cluster contains a reticulum  server and a postgress DB, which both store their data on disk. In these steps we are moving this storage to a persistent Azure Disk. The steps are as follows:

1) Go to 'Storage Account and click on `Create`

2) Fill in the form to create a new storage account, use default settings where given

* On the 'Networking' tab, set the `network access` to Enable public access from selected virtual networks and IP addresses.
* In the configuration field, choose the Virtual Network in which your cluster is installed. This should block public access.

3) Finish the process and create your storage account

### Create a persistent volume claim

We need to add a `Persistent Volume Claim` to our cluster, to which we can connect our reticulum  storage. Note that this will automatically create a `Persistent volume`, based on the given (default) Storage Class.

We can choose between Azure Disk and Azure Files. While we want multiple pods to be able to access the shared volume, we need to use a Storage class that uses Azure Files. See: <https://learn.microsoft.com/en-us/azure/aks/azure-files-csi>

Once we created this, we can change the reticulum  and postgresdb config in `hcce.yaml` to use this new persistent storage. For details see: <https://learn.microsoft.com/en-us/azure/aks/azure-csi-files-storage-provision>

1) Create and adjust the following azure-pvc.yaml file to create the your PVC's. We use seperate PVC's here for reticulum (files) and the Postgress database, although you could also use the same.

We can choose from two default storage classes that should be fine:

```text
- azurefile-csi: Uses Azure Standard Storage to create an Azure file share.
- azurefile-csi-premium: Uses Azure Premium Storage to create an Azure file share.
```


```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-files-reticulum
  namespace: hcce
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: azurefile-csi
  resources:
    requests:
      storage: 100Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-files-postgres
  namespace: hcce
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: azurefile-csi
  resources:
    requests:
      storage: 100Gi
```

Both of the default storage classes should allow you to increase storage , by updating the above yaml later. If you want to change or check this, you can edit the storage class with `kubectl edit sc azurefile-csi` and look for `allowVolumeExpansion: true`.

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
          claimName: pvc-files-reticulum

      - name: config
        configMap:
          name: ret-config

... 
#and further down for postrgresql (in case you are nor using an external database)
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
            claimName: pvc-files-postgres   
#--
```

4) We add a `subPath` for the Postgresql volume because postgresql likes to start in an empty folder (<https://stackoverflow.com/questions/51168558/how-to-mount-a-postgresql-volume-using-aws-ebs-in-kubernete>)

5) Update your cluster by running the render and apply scripts `bash render_hcce.sh && kubectl apply -f hcce.yaml` (note: this will only apply the changes)

6) You should now have persistent storage. You can find it in the Azure portal, under `Kubernetes service`  > `Storage`


## Deploy Hubs CE

1) Although it was written for a different cloud environment (but still with Kubernetes), you can read this installation manual for a good understanding of the required steps: <https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/> .

2) Clone the hubs repo

3) Go to the /community-edition directory

4) Connect to your cluster (see above)

5) Change the setup values in the installation script `render_hcce_sh`

6) Follow the instructions and run : `bash render_hcce.sh && kubectl apply -f hcce.yaml`

>Tip: use a docker image to avoid issues with local versions of openssl, see 'Use Docker image to deploy' below

__Important: Make sure to check the ouput logs, you are problably missing an NPM package (pem-jwk) . Install it using the instructions given (this is already included in the Docker image)__

## Connect your domain to Hubs CE

Now your cluster is running, you need to connect it to your domain. This needs to be done at your DNS provider.

1) You can find the public IP of your Kubernetes cluster via:

```bash
kubectl get svc lb -n hcce
```

Alternatively you can go to `Services and ingresses` under you Kubernetes service in the Azure portal, and look for the `External IP` for the loadbalancer service (`lb`)

2) At your DNS provider, change the DNS 'A-entries' for `<your-domain>`, `assets.<domain>`, `stream.<domain>` and `cors.<domain>` to the public IP of the cluster

__You should now be able to access your cluster (with bypassing the warning for self-signed certificates)!__

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

So , when your domain is running on `myhubs.com`, your secret will be called:`cert-myhubsce.com`

Use the same command for `cert-assets.<your-domain>`, `cert-cors.<your-domain>`, and  `cert-stream.<your-domain>`

Some things to check:

* Don't forget to create them in the right namespace, in this case `hcce`.

* If you want to create a backup of the existing certs before you delete them (not sure why but it might feel safe), this can be done by using the portal to view the contents of the secrets as explained further below

* Make sure to build your certificate.pem with the domain certificate _on top_ and paste the cabundle below that. REMOVE ANY EMPTY LINES BETWEEN THE CERTIFICATES!

* If you already visited your cluster, it might take a while before the cached self-signed certificates are updated. You could check the validity of your new certificates at e.g. https://stream.\<your-domain\> as that might not have been cached yet in your network.

### Adjust kubernetes configuration to make sure your main domain certificate is working

Make the following change to ensure the main certificate is working: change the default-ssl-certificate in the haproxy config (in hcce.yaml) to point to your main domain certificate secret

```yaml
      containers:
        - name: haproxy
...
            - --log=warning #error warning info debug trace
            # REPLACE THIS LINE
            - --default-ssl-certificate=$Namespace/cert-hcce
            # INTO THIS LINE
            - --default-ssl-certificate=$Namespace/<NAME OF YOUR MAIN DOMAIN CERTIFICATE SECRET>
```

## Configure your firewall (for audio/speech and more)

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
8) If you are using an external SMTP server, you also need to open up port 587 outbound
9) If you want to connect to your database remotely (eg. using PGadmin), you may also need to open up port 5432 outbound

## Setup container registry for custom client code

To use a custom client you need to store the docker image somewhere. We use the Azure Container Registry for this so everything is in one place. The following things need to happen:

* We need to create a container registry service on Azure

* We need to give the Kubernets cluster 'pull' rights from the registry

* We need access from the command line to push/pull our custom client code

### Create the Azure Container Registry service

Azure offers it's own container registry service that is compatible with docker commands. For more info:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro>

You can set it up via the Azure portal, as follows:
<https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal?tabs=azure-cli>

### Give our Kubernetes cluster rights to pull from the registry and create a secret

In case you didn't create the cluster with `--attach-acr <acrName>` (see above), you can still do that now.

Azure has an integrated option to the `az aks` command to attach a registry. This will give the cluster rights to pull from the registry.

To update an existing cluster, use this command:

```bash
az aks update -n myAKSCluster -g myResourceGroup --attach-acr <acrName>
```

### Alternative method

An alternative way is to manually grant access to the registry, and create a pull secret. Here we can leverage the managed identity that is automatically created for the Kubernetes cluster (as it is for every Azure entity).

To let our cluster pull from the registry we need to give our cluster access to the registry, and create an image pull secret to use during deployment (see <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes>)

1) Go to Access Control (IAM) in the Azure Container Registry
2) Add a new role assignment
3) Choose the role 'AcrPull'
4) Assign it to a 'Managed identity', and under 'Select members', select your Kubernetes cluster.
5) Store changes

Then create and use an image pull secret in your cluster configuration:

1) Use the following `kubectl` command to create your secret (you can choose your own name)

```bash
kubectl create secret docker-registry <secret-name> \
    --namespace <namespace> \
    --docker-server=<container-registry-name>.azurecr.io \
    --docker-username=<service-principal-ID> \
    --docker-password=<service-principal-password>
```

By default your cluster will be installed as a managed service identity (msi) and won't have a service principal ID, you need to create one.

2) Then change your cluster configuration to uses the pull secret. In your `hcce.yaml` file:

```yaml
########################################################################
######################   hubs   ########################################
########################################################################
apiVersion: apps/v1
kind: Deployment
....
  template:
    metadata:
      labels:
        app: hubs
    spec:
#--           ADD THIS SECTION:
      imagePullSecrets:
        - name: <secret-name>
#--           
      containers:
        - name: hubs
          image: <your custom container>:<your tag>
          imagePullPolicy: IfNotPresent
...

```

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

## Configure CORS and other 'server settings'

If you are coming from Hubs-cloud you are familiar with a menu panel called Server settings. Here you could set CORS headers and some other things.

In Hubs CE, this panel is no longer there, but you can find the settings in the hcce.yam(l) file, under `ret-config`, under `[ret."Elixir.RetWeb.Plugs.AddCSP"]`

If your cluster should be allowed to receive requests from other servers (eg. use the api), you need to add that domain to the `access-control-allow-origin` in the `ingress` deployment configuration.

```yaml
######################################################################################
###################################### ingress #######################################
######################################################################################
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  ...
    haproxy.org/response-set-header: |
      access-control-allow-origin "<either '*', or 'https://$HUB_DOMAIN' and a comma seperated list of other domains to allow>"
```

## Deploy custom client

>todo: this is not complete yet, these are some tips I found elsewhere, and needs to be checked.

1) In the hubs client directory, (assuming you have docker desktop installed already) you can find the docker file as `RetPageOriginDockerfile`. For convenience, we rename it to `Dockerfile` here.

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

If you are trying to resolve dependencies, you might want to see a bit more output. You can change that in the dockerfile here:

```bash
run npm run build 1> /dev/null
```

Just remove `1> /dev/null` to actually see the logs.