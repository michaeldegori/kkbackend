#!/bin/bash
cd ~/backups
mongoimport --db kiddiekredit --collection KidDashboardEI --file KidDashboardEI.json
mongoimport --db kiddiekredit --collection ParentDashboardEI --file ParentDashboardEI.json
mongoimport --db kiddiekredit --collection alerts --file alerts.json
mongoimport --db kiddiekredit --collection builtinchores --file builtinchores.json
mongoimport --db kiddiekredit --collection builtinrewards --file builtinrewards.json
mongoimport --db kiddiekredit --collection choresuggestions --file choresuggestions.json
mongoimport --db kiddiekredit --collection familyunits --file familyunits.json
mongoimport --db kiddiekredit --collection users --file users.json
