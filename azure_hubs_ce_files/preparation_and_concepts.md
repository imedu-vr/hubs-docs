
Install Hubs CE on Azure Kubernetes Service

# Preparations & important concepts

---

## [Index](../azure_hubs_ce_installation.md)

* Preparations & important concepts (this chapter)

* [Installation](installation.md)

* [Migrate data](migrate_data.md)

* [Tips & problem solving](tips_and_problem_solving.md)

---

This installation manual for Hubs Community Edition on Azure was based on community edition status of Dec 18 2023, and includes some tips from the Hubs community. Disclaimer: I'm not an expert on Azure, so their might be betters ways to do this.

Make sure to read the whole manual before starting, including the steps for installing Hubs (under Deploy hubs), to see which domains and other settings you need. There is a lot to learn about Kubernetes and Azure, which you can find in the online tutorials. Here are some important concepts to understand for this manual:

## Understanding Docker and Kubernetes

While Kubernetes works with docker containers, you need to have some basic understand how these are created, managed and used for installations. This could be a good introduction: <https://www.youtube.com/watch?v=pg19Z8LL06w>

Understanding the core concepts of Kubernetes will also be essential to help you understand the installation steps and structure in Azure. This video provides a good overview in about 30 minutes: <https://youtu.be/s_o8dwzRlu4?si=B0Ay2rvhrLTO9Hq1> (you can optionally skip the second part where they setup a cluster on a different platform)

## Understanding Azure

Explaining Azure and all it's services and options goes beyond the scope of this instruction. The best way to start is probably the 'Quickstart Center' (you can find that in the portal <https://portal.azure.com/#view/Microsoft_Azure_Resources/QuickstartCenterBlade>

### Introduction to Azure Kubernetes Service

Even if you prefer to 'learn while doing', it might be smart to at least read this overview of AKS (a managed Kubernetes service on Azure): <https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes>

### Access control using Managed Identities and Service Principals

Managed identies are a way to let services use other services within your Azure environment, without having to store or manage credentials. We will need this for setting up our email service, so it is good to understand the basics.

These Managed identities are handled by Active Directory (called Microsoft Entra ID), and a managed identity is always linked to a 'service principal' in the AD backend. Most of the time you could see this as two things referring to the same. There is a seperate portal section for creating managed identities, just search for 'Managed Identities' to find it.

For a good introduction and video, see: <https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview>

If you don't like to watch the video, here is a short description of the three types of managed identities:

#### System assigned managed identities

Every service in Azure automatically gets a `system assigned managed identity`. And you can use these automatic identities when assigning role based access. The advantage is that when the service disappears, the managed identity also disappears, including the access rights.

#### User assigned managed identities

Besides the system assigned managed identities, you can assign 'custom' managed identities as a user called `user assigned managed identities`. These can be created as much as you liked, and can also be used in role based assignments. 

The difference with system assigned managed identities is that the 'user assigned' are not linked to a service by default, but you need to do that manually by going to the 'Identity' page under a service. Here you can add alternative identites for the service.

#### Authenticate as a service principal using Entra ID applications

Finally, there are `registered applications` in Azure Active Directory ('Microsoft Entra ID'). These provide authentication and authorization services for applications. When you register an app in Microsoft Entra ID it also creates a service principal in the backend, that you can use in the same way for role-based access. Besides that, you can also generate credentials to e.g. authenticate as that service principal from an external system.

## Storage in AKS

See <https://learn.microsoft.com/en-us/azure/aks/concepts-storage> for an introduction on how storage is handled in AKS
