Install Hubs CE on Azure Kubernetes Service

# Tips & problem solving

---

## [Index](../azure_hubs_ce_installation.md)


* [Preparations & important concepts](preparations_and_concepts.md)

* [Installation](installation.md)

* [Migrate data](migrate_data.md)

* Tips & problem solving (this chapter)

---

## Reticulum server won't start

First check the logs with kubectl:

```bash
kubectl logs <your reticulum pod id> -n hcce
```

If you see an SQL/Database error, it could be an error/conflict when creating tables in the coturn schema. You can try the following:

* (Probably?) you can safely delete the tables in the coturn schema on your database. 

* Remove your reticulum deployment

```bash
kubectl delete deployment reticulum -n hcce
```

Reapply your cluster config:

```bash
kubectl apply -f hcce.yaml
```

Optionally (if you see some crashed pods for example) delete all pods:

```bash
kubectl delete pods --all -n hcce
```

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
