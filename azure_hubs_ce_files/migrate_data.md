Install Hubs CE on Azure Kubernetes Service

# Migrate data

---

## [Index](../azure_hubs_ce_installation.md)

* [Preparations & important concepts](preparations_and_concepts.md)

* [Installation](installation.md)

* Migrate data (this chapter)

* [Tips & problem solving](tips_and_problem_solving.md)

---

> Todo: needs completion and cleanup, currently some random notes

To migrate any data from our Hubs Cloud environment (or another Hubs CE cluster) to our Hubs CE edition, we need to do several things:

* Migrate the database
* Copy the files
* Fix the file references in our DB

### Preparation

1) Install unzip and AWS cli on you Hubs cloud server (or other source system)

```bash
sudo apt install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

see <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html?bck-files-amz-s3>

2) Run aws configure to login to your AWS environment, make sure you login to the region of your bucket

### Copy the database

To copy the database we are going to export the tables from one of our Hubs Cloud application servers and upload it to an S3 bucket. From there we can download it and import it in our CE cluster

#### Export from Hubs Cloud

3) Log in to your application server of the cluster (use the verification code in the admin panel)

4) Go to /home/ubuntu and create a directory called 'dump'

5) Create the following file in /home/ubuntu/, call it `export_tables.sh`

```bash
#!/bin/bash
  
# Make sure to save this script to a .sh file and give it executable permissions using chmod +x script.sh. Then, you can run the script to export the data from multiple tables to CSV files.

# Define your PostgreSQL database connection parameters
db_host="<aws RDS endpoint>"
db_user="postgres"
db_name="polycosm_production"
output_directory="/home/ubuntu/dump"

# List of tables to export (modify as needed)
tables=("account_favorites" "accounts" "api_credentials" "app_configs" "assets" "avatar_listings" "avatars" "cached_files" "hub_bindings" "hub_invites" "hub_role_memberships" "hubs" "identities" "login_tokens" "logins" "oauth_providers" "owned_files" "project_assets" "projects" "room_objects" "scene_listings" "scenes" "schema_migrations")

# Loop through the tables and export each one to a CSV file
for table in "${tables[@]}"; do
    psql -U "$db_user" -h localhost "$db_name" -c "\COPY $table TO '$output_directory/$table.csv' WITH CSV HEADER;"
done

echo "Data export completed."
```

* Make the file executable with `chmod +x ./export_tables.sh`

* Run it with bash: `bash ./export_tables.sh`

* Go to the dump directory and upload the files to an S3 bucket using the AWS cli

```bash
aws s3 cp your-directory-path s3://your-bucket-name/ --recursive --exclude "*" --include "*.csv"
```

#### Import into CE

TODO

See: <https://github.com/hubs-community> and then: <https://github.com/hubs-community/import_assets>

And:
<https://discord.com/channels/498741086295031808/1187869861632811038/1187870033813196821>
<https://discord.com/channels/498741086295031808/1187869861632811038/1187879001633603646>
