import {
  getPendingTasks
} from "./src/task-service.js";
import{
    demoTasks
}from "./src/data.js"



const pendingDemo = getPendingTasks(demoTasks);
const pendingEmpty = getPendingTasks([]);

console.log(
  "demoTasks:",
  pendingDemo.map((task) => task.id)
);

console.log(
  "Пустой массив:",
  pendingEmpty
);