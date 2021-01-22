# Kiddie Kredit Back End

### Infrastructure components

All the infrastructure is hosted in us-east-1, except the domain name SOA, which is under godaddy. All infrastructure was created manually.

AWS infrastructure components:  
* Elastic IP address
* S3 bucket - kk-internal-resources: holds canary source code
* S3 bucket kkadmin: hosts small admin portal (allows administration of educational content within the app)
* S3 bucket - kkfrontend-complaints-bounces-buckets: a bucket to host bounced emails and complaints fro our AWS SES integration
* EC2 Instance - kiddiekredit dev environment (inactive)
* EC2 Instance - big server. This is the prod instance hosting mongodb as well as the nodejs application server
* Lambda - kkfrontend-complaints-bounces-lambda. This lambda is used by SES to handle bounces and complaints.
* Lambda - HealthCheck. This lambda performs a health check. It's missing a CWE trigger to fire every few minutes, and an alarm set up to alert us when there are health check failures. The code looks unfinished too.
* **CRON jobs**: there are two cron jobs that were directly created on the prod host. They do the nightly computations of completed chores and the weekly computations of credit scores. These should be hoisted from this server.

### Running the nodejs app locally
1. Manually create the file `.cert.pem` with the contents of the secret required for token signature verification (This needs to be obtained from the kk team)
2. Install mongodb locally
3. Ensure mongodb is running
4. run `npm start`

### Running the nodejs app in prod

In production, the nodejs app is managed by pm2. The configuration being used by pm2 is in the file `ecosystem.config.js`, and the script used to start the app is in package.json: `npm run startprod`

The jwt secret needs to be manually deployed to prod as well in order to do a fresh build. 

