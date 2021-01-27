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

### Data model

All the models are defined in a pretty straightforward manner as mongoose models in the `services` folder. Each model represents a collection of objects with a particular shape. We have the following models:

1. Educational Info:
  * ParentDashboardEI: the string values of the educational info modals in the parent app.
  * KidDashboardEI: the string values of the educational info modals in the child app.
2. Alert: This represents one of the alerts you see in the Alerts tab.
  ```
  {
      familyUnit: {type: Schema.Types.ObjectId, index: true},
      kid: {type: Schema.Types.ObjectId},
      chore: {type: Schema.Types.ObjectId},
      timeStamp: Number,
      isTappable: Boolean,
      status: {type: String, enum:["new", "processed"]},
      notificationBody: String,
      recipient: String, //matches up to browsing_mode
      doneChoreId: Schema.Types.ObjectId,
      invisibleTo: []
  }
  ```
3. Family Unit (our main unit of data, the centerpoint of an account):
```
{
    adminsList: [{type: 'String'}],
    kidsList: [KidInfoSchema],
    existingChores: [ChoreSchema],
    choreExceptions: [Schema.Types.Mixed],
    existingRewards: [RewardSchema],
    lastProcessedTime: Number
}
```
4. Kid Info:
```
{
    name: {type: String},
    dob: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    assignedChores: [Chore],
    eligibleRewards: [Reward],
    rewardsRedemptions: [{
        id: Schema.Types.ObjectId,
        timeStamp: Number,
        reward: Schema.Types.ObjectId
    }],
    doneChores: [{
        id: Schema.Types.ObjectId,
        timeStamp: Number,
        chore: Schema.Types.ObjectId,
        status: {type: String, enum: ['approved', 'unapproved', 'denied']}
    }],
    delinquentChoreInstances: [
        {
            id: Schema.Types.ObjectId,
            timeStamp: Number,
            chore: Schema.Types.ObjectId
        }
    ],
    allowanceAmount: {type: Number},
    savingsRequired: {type: Number},
    avatar: {type:String},
    kreditInformation: {
        kiddieKashBalance: {type: Number},
        utilization: { numerator: Number, denominator: Number },
        choreHistory: { numerator: Number, denominator: Number },
        avgChoreAge: { numerator: Number, denominator: Number },
        totalChores: { numerator: Number, denominator: Number },
        inquiries: { numerator: Number, denominator: Number },
        punishments: { type: Schema.Types.Mixed },
    }
}
```
5. Chore
```
{
    name: {type: String, required: true},
    priority: {type: String, required: true},
    kkReward: {type: String, required: true},
    notes: {type: String},
    repetitionRule: {type: String, required: true},
    startDate: {type: Number, required: true},
    endDate: {type: Number},
    paused: {type: Boolean, default: false},
    description: String,
    deleted: {type: Boolean, default: false}
}
```
6. Reward
```
{
    name: {type: String},
    kkCost: {type: Number},
    notes: ""
}
```
