import { demoTasks } from "../practice-02/src/data.js";
import { setTaskCompleted } from "../practice-02/src/task-service.js";

const successResult = setTaskCompleted(
  demoTasks,
  4,
  true
);

console.log(
  "Новый статус id=4:",
  successResult.tasks.find(
    (task) => task.id === 4
  ).completed
);

console.log(
  "Исходный статус id=4:",
  demoTasks.find(
    (task) => task.id === 4
  ).completed
);

const errorResult = setTaskCompleted(
  demoTasks,
  777,
  true
);

console.log(
  "Результат id=777:",
  errorResult
);