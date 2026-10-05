"use strict";

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

const plannedTasks = Number(plannedText);
const completedTasks = Number(completedText);
const additionalTasks = Number(additionalText);

const completedTotal = completedTasks + additionalTasks;
const remainingTasks = plannedTasks - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
    controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);