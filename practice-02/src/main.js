import {
  demoTasks,
  variantNumber,
  variantTasks,
} from "./data.js";

import {
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function showStats(tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);

  console.log(
    `Всего: ${total}, выполнено: ${completed}, осталось: ${pending}`
  );

  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}


// =====================
// Общий сценарий
// =====================

console.log("ОБЩИЙ СЦЕНАРИЙ");

let currentTasks = demoTasks;

console.log("Исходные задачи:");
console.log(currentTasks);

console.log("Названия:");
console.log(getTaskTitles(currentTasks));

console.log("Невыполненные:");
console.log(getPendingTasks(currentTasks));

showStats(currentTasks);


let result = addTask(
  currentTasks,
  20,
  "Добавить проверку",
  "high"
);

if (result.ok) {
  currentTasks = result.tasks;
}

showStats(currentTasks);


result = setTaskCompleted(currentTasks, 4, true);

if (result.ok) {
  currentTasks = result.tasks;
}

showStats(currentTasks);


result = renameTask(
  currentTasks,
  10,
  "Подготовить инструкцию запуска"
);

if (result.ok) {
  currentTasks = result.tasks;
}

showStats(currentTasks);


result = removeTask(currentTasks, 7);

if (result.ok) {
  currentTasks = result.tasks;
}

showStats(currentTasks);


// Ошибка
result = addTask(
  currentTasks,
  20,
  "Повторная задача",
  "low"
);

if (!result.ok) {
  console.log(`Ошибка: ${result.error}`);
}


console.log(
  "Итоговые id:",
  currentTasks.map((task) => task.id)
);

console.log(
  "Исходный demoTasks:",
  demoTasks
);


// =====================
// Вариант №3
// =====================

console.log(`\nВАРИАНТ №${variantNumber}`);

let currentVariantTasks = variantTasks;

showStats(currentVariantTasks);


// Добавить id = 80
result = addTask(
  currentVariantTasks,
  80,
  "Добавить форму обратной связи",
  "low"
);

if (result.ok) {
  currentVariantTasks = result.tasks;
}


// Выполнить id = 11
result = setTaskCompleted(
  currentVariantTasks,
  11,
  true
);

if (result.ok) {
  currentVariantTasks = result.tasks;
}


// Переименовать id = 23
result = renameTask(
  currentVariantTasks,
  23,
  "Подготовить подробное описание проектов"
);

if (result.ok) {
  currentVariantTasks = result.tasks;
}


// Удалить id = 37
result = removeTask(
  currentVariantTasks,
  37
);

if (result.ok) {
  currentVariantTasks = result.tasks;
}


// Повторно добавить id = 80
result = addTask(
  currentVariantTasks,
  80,
  "Повторная задача",
  "low"
);

if (!result.ok) {
  console.log(`Ошибка: ${result.error}`);
}


console.log(
  "Итог варианта:",
  currentVariantTasks
);

showStats(currentVariantTasks);

console.log(
  "Исходный variantTasks:",
  variantTasks
);