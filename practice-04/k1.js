import { validateTaskDraft } from "./src/form-validation.js";

const tasks = [];

const first = validateTaskDraft(
  {
    id: "20",
    title: " Изучить localStorage ",
    priority: "high",
  },
  tasks,
);

const second = validateTaskDraft(
  {
    id: "20",
    title: " ",
    priority: "high",
  },
  tasks,
);

console.log("Проверка 1:", first);
console.log("Проверка 2:", second);