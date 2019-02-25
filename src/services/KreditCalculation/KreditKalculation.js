/**
 *
 * @param familyUnit a family unit according to mongoose schema
 * @returns {
 *     [kidId1]: {
 *         rewardsRedemptions -> utilization
 *         choreHistory
 *         avgChoreAge,
 *         totalChores,
 *         rewardsRequests, -> inquiries
 *         punishments?
 *     },
 *     [kidId2]: ...
 * }
 */
function getKreditInformationForFamilyUnit(familyUnit){
    const allCreditReports = {};
    familyUnit.kidsList.forEach(kid => {
        allCreditReports[kid._id.toString()] = {
            utilization: {numerator: computeUtilization(familyUnit, kid), denominator: 30},
            choreHistory: {numerator: computeChoreHistory(familyUnit, kid), denominator: 35},
            avgChoreAge: {numerator: computeAvgChoreAge(familyUnit, kid), denominator: 15},
            totalChores: {numerator: computeTotalChores(familyUnit, kid), denominator: 10},
            inquiries: {numerator: computeInquiries(familyUnit, kid), denominator: 10},
            punishments: computePunishments(familyUnit, kid)

        };
    });

    return allCreditReports;
}
function getKreditInformationForKid(familyUnit, kid){
    return {
        utilization: {numerator: computeUtilization(familyUnit, kid), denominator: 30},
        choreHistory: {numerator: computeChoreHistory(familyUnit, kid), denominator: 35},
        avgChoreAge: {numerator: computeAvgChoreAge(familyUnit, kid), denominator: 15},
        totalChores: {numerator: computeTotalChores(familyUnit, kid), denominator: 10},
        inquiries: {numerator: computeInquiries(familyUnit, kid), denominator: 10},
        punishments: computePunishments(familyUnit, kid)
    };
}



function computeUtilization(familyUnit, kid){
    const timeStampLastWeek = new Date().getTime() - 1000*60*60*24*7;
    const redeemedRewards = kid.rewardsRedemptions.map(rewardLink => ({
        ...rewardLink,
        reward: familyUnit.existingRewards.find(fReward => fReward._id.toString() === rewardLink.reward.toString())
    }));
    const redeemedRewardsValue = redeemedRewards.filter(r => r.timeStamp > timeStampLastWeek).reduce((p,c) => p + Number(c.reward.kkCost), 0);
    const kkBalance = (kid.kreditInformation && kid.kreditInformation.kiddieKashBalance) || 0;

    if (redeemedRewardsValue === 0 && kkBalance > 0) return 30;

    let utilizationThreshold = 10;
    const utilizationRatio = kkBalance > 0 ? Math.round(redeemedRewardsValue*100/(kkBalance+redeemedRewardsValue)) : 100;
    if (utilizationRatio <= 10) return 20;

    if (utilizationRatio <= (100 - utilizationThreshold)) return 30;
    return 30 - (utilizationRatio-90);
}

function computeChoreHistory(familyUnit, kid) {
    if (!kid.delinquentChoreInstances || kid.delinquentChoreInstances.length === 0) return 35;
    const sixWeeksAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7 * 6 - 3600000;
    const delinquentChores = kid.delinquentChoreInstances
        .filter(delinquentRecord => delinquentRecord.timeStamp > sixWeeksAgo)
        .map(delinquentRecord => ({
        ...delinquentRecord,
        chore: familyUnit.existingChores.find(chore=> chore._id.toString() === delinquentRecord.chore.toString())
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
    const kidsChoresAgesInDays = kidsChores.map(chore => (now - chore.startDate)/oneDay);
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

function computeInquiries(familyUnit, kid) {
    const sevenDaysAgo = new Date().getTime() - 7 * 1000 * 60 * 60 * 24;
    const rewardsThisWeek = (kid.rewardsRedemptions || []).filter(rewardRedemption => rewardRedemption.timeStamp && rewardRedemption.timeStamp >= sevenDaysAgo);
    const numRewardsThisWeek = rewardsThisWeek.length;
    if (numRewardsThisWeek <= 5) return 10;
    return Math.max(0, 10 - (numRewardsThisWeek - 5));
}

function computePunishments(familyUnit, kid) {
    return 0;
}

function dateFromObjectId (objectId) {
    return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};


module.exports = {
    getKreditInformationForFamilyUnit,
    getKreditInformationForKid,
    computeUtilization: computeUtilization,
    computeChoreHistory,
    computeAvgChoreAge,
    computeTotalChores,
    computeInquiries,
    computePunishments,
};