#!/bin/bash
cd ~/backups
mongoexport --db kiddiekredit --collection KidDashboardEI --out KidDashboardEI.json
mongoexport --db kiddiekredit --collection ParentDashboardEI --out ParentDashboardEI.json
mongoexport --db kiddiekredit --collection alerts --out alerts.json
mongoexport --db kiddiekredit --collection builtinchores --out builtinchores.json
mongoexport --db kiddiekredit --collection builtinrewards --out builtinrewards.json
mongoexport --db kiddiekredit --collection choresuggestions --out choresuggestions.json
mongoexport --db kiddiekredit --collection familyunits --out familyunits.json
mongoexport --db kiddiekredit --collection users --out users.json
scp ./* kkbig:~/backups/
