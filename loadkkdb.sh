#!/bin/bash
cd ~/backups
mongoimport --db kiddiekredit --collection KidDashboardEI --out KidDashboardEI.json
mongoimport --db kiddiekredit --collection ParentDashboardEI --out ParentDashboardEI.json
mongoimport --db kiddiekredit --collection alerts --out alerts.json
mongoimport --db kiddiekredit --collection builtinchores --out builtinchores.json
mongoimport --db kiddiekredit --collection builtinrewards --out builtinrewards.json
mongoimport --db kiddiekredit --collection choresuggestions --out choresuggestions.json
mongoimport --db kiddiekredit --collection familyunits --out familyunits.json
mongoimport --db kiddiekredit --collection users --out users.json
