/**
 *
 * @param familyUnit a family unit according to mongoose schema
 * @returns {
 *     [kidId1]: {
 *         rewardsRedemptions
 *         choreHistory
 *         avgChoreAge,
 *         totalChores,
 *         rewardsRequests,
 *         punishments?
 *     },
 *     [kidId2]: ...
 * }
 */
function getKreditInformationForFamilyUnit(familyUnit){
    const allCreditReports = {};
    familyUnit.kidsList.forEach(kid => {
        allCreditReports[kid._id.toString()] = {
            rewardsRedemptions: computeRewardsRedemptions(familyUnit, kid),
            choreHistory: computeChoreHistory(familyUnit, kid),
            avgChoreAge: computeAvgChoreAge(familyUnit, kid),
            totalChores: computeTotalChores(familyUnit, kid),
            rewardsRequests: computeRewardsRequests(familyUnit, kid),
            punishments: computePunishments(familyUnit, kid)

        };
    });

    return allCreditReports;
}



function computeRewardsRedemptions(familyUnit, kid){
    const redeemedRewards = kid.rewardsRedemptions.map(rewardLink => ({
        ...rewardLink,
        reward: familyUnit.existingRewards.find(fReward => fReward._id.toString() === rewardLink.id.toString())
    }));
    const redeemedRewardsValue = redeemedRewards.reduce((p,c) => p + Number(c.reward.kkCost), 0);
    const kkBalance = (kid.kreditInformation && kid.kreditInformation.kiddieKashBalance) || 0;

    if (kkBalance === 0 && redeemedRewardsValue === 0) return 20;
    if (kkBalance === 0) return 20;

    const utilizationThreshold = (kid.kreditInformation && kid.kreditInformation.savingsRequired) || 10;
    const utilizationRatio = Math.round(redeemedRewardsValue*100/kkBalance);
    if (utilizationRatio <= 10) return 20;

    if (utilizationRatio <= (100 - utilizationThreshold)) return 30;
    return 30 - (utilizationRatio-90);
}

function computeChoreHistory(familyUnit, kid) {
    if (!kid.delinquentChoreInstances || kid.delinquentChoreInstances.length === 0) return 35;
    const delinquentChores = kid.delinquentChoreInstances.map(delinquentRecord => ({
        ...delinquentRecord,
        chore: familyUnit.existingChores.find(chore=> chore._id.toString() === delinquentRecord.id.toString())
    }));
    const pointsDeduction = delinquentChores.map(delinquentRecord => Number(delinquentRecord.chore.priority || 1) )
        .reduce((p,c) => p+c, 0);
    return Math.max (35 - pointsDeduction, 0);
}

function computeAvgChoreAge(familyUnit, kid) {
    if (!kid.assignedChores || kid.assignedChores.length === 0) return 0;

    const kidsChores = kid.assignedChores.map(choreId => familyUnit.existingChores.find(chore => chore._id.toString() === choreId.toString()));
    const oneDay = 1000 * 60 * 60 * 24;
    const now = new Date().getTime();
    const kidsChoresAgesInDays = kidsChores.map(chore => Math.ceil((now - chore.startDate)/oneDay) );
    const avgAge = kidsChoresAgesInDays.reduce((p,c) => p+c, 0)/kidsChores.length;
    if (avgAge >= 42) return 15;

    return Math.max(0, 15 - (42-Math.ceil(avgAge))*0.5);
}

function computeTotalChores(familyUnit, kid) {
    if (!kid.assignedChores || kid.assignedChores.length === 0) return 0;
    const numChores = kid.assignedChores.length;
    if (numChores >= 5) return 10;
    return 10 - 2*(5-numChores);
}

function computeRewardsRequests(familyUnit, kid) {
    const sevenDaysAgo = new Date().getTime() - 7 * 1000 * 60 * 60 * 24;
    const rewardsThisWeek = (kid.rewardsRedemptions || []).filter(rewardRedemption => rewardRedemption.timeStamp && rewardRedemption.timeStamp >= sevenDaysAgo);
    const numRewardsThisWeek = rewardsThisWeek.length;
    if (numRewardsThisWeek <= 5) return 10;
    return Math.max(0, 10 - (numRewardsThisWeek - 5));
}

function computePunishments(familyUnit, kid) {
    return 0;
}


module.exports = {
    getKreditInformationForFamilyUnit,
    computeRewardsRedemptions,
    computeChoreHistory,
    computeAvgChoreAge,
    computeTotalChores,
    computeRewardsRequests,
    computePunishments,
};