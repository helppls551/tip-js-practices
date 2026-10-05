"use strict";

const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;

if (
    !Number.isFinite(totalTasks) ||
    !Number.isFinite(completedTasks) ||
    !Number.isInteger(totalTasks) ||
    !Number.isInteger(completedTasks)
) {
    console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || completedTasks < 0) {
    console.log("Ошибка: количество задач не может быть отрицательным.");
} else if (totalTasks > 1000) {
    console.log("Ошибка: количество задач не может превышать 1000.");
} else if (completedTasks > totalTasks) {
    console.log("Ошибка: выполнено больше задач, чем существует.");
} else if (
    !Number.isFinite(dailyLimit) ||
    !Number.isInteger(dailyLimit)
) {
    console.log("Ошибка: дневная норма должна быть целым числом.");
} else if (dailyLimit < 1 || dailyLimit > 1000) {
    console.log("Ошибка: дневная норма должна быть от 1 до 1000.");
} else {
    let remainingTasks = totalTasks - completedTasks;
    let day = 0;

    if (remainingTasks === 0) {
        console.log("Все задачи уже выполнены");
        console.log("Потребуется дней: 0");
    } else {
        console.log(`Осталось задач: ${remainingTasks}`);

        while (remainingTasks > 0) {
            day += 1;

            const tasksToday = Math.min(dailyLimit, remainingTasks);

            remainingTasks -= tasksToday;

            console.log(
                `День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`
            );
        }

        console.log(`Потребуется дней: ${day}`);
    }
}