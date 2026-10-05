"use strict";

console.log("Эксперимент 1");

function sum(a, b) {
  return a + b;
}

const numberSum = sum(5, 3);
const stringSum = sum("5", 3);

console.log(numberSum);
console.log(typeof numberSum);

console.log(stringSum);
console.log(typeof stringSum);


console.log("\nЭксперимент 2");

const square = (value) => {
  return value * value;
};

console.log(square(4));


console.log("\nЭксперимент 3");

const originalTask = {
  title: "Подготовить отчёт",
  completed: false,
};

const taskAlias = originalTask;

taskAlias.completed = true;

console.log(originalTask.completed);
console.log(originalTask === taskAlias);


console.log("\nЭксперимент 4");

const originalTasks = [
  {
    id: 1,
    title: "Первая задача",
    completed: false,
  },
];

const copiedTasks = [...originalTasks];

copiedTasks[0].completed = true;

console.log(originalTasks === copiedTasks);
console.log(originalTasks[0] === copiedTasks[0]);
console.log(originalTasks[0].completed);


console.log("\nЭксперимент 5");

const originalPriorityTask = {
  id: 2,
  priority: "low",
};

const changedTask = {
  ...originalPriorityTask,
  priority: "high",
};

const wrongOrderTask = {
  priority: "high",
  ...originalPriorityTask,
};

console.log(originalPriorityTask.priority);
console.log(changedTask.priority);
console.log(wrongOrderTask.priority);
console.log(originalPriorityTask === changedTask);


console.log("\nЭксперимент 6");

function makeCaption(text = "Без названия") {
  return text;
}

console.log(makeCaption());
console.log(makeCaption(undefined));
console.log(makeCaption(null));
console.log(makeCaption(""));