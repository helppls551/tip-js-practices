function checkId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function checkTitle(title) {
  if (typeof title !== "string") {
    return null;
  }

  const newTitle = title.trim();

  if (newTitle.length < 1 || newTitle.length > 100) {
    return null;
  }

  return newTitle;
}

export function createTask(id, title, priority = "medium") {
  if (!checkId(id)) {
    return { ok: false, error: "Некорректный id" };
  }

  const newTitle = checkTitle(title);

  if (newTitle === null) {
    return { ok: false, error: "Некорректное название" };
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return { ok: false, error: "Некорректный приоритет" };
  }

  return {
    ok: true,
    task: {
      id,
      title: newTitle,
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;

  for (const task of tasks) {
    if (task.completed === true) {
      completed++;
    }
  }

  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return {
    total,
    completed,
    pending,
    progress,
  };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);

  if (!result.ok) {
    return result;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: "Такой id уже существует" };
  }

  return {
    ok: true,
    tasks: [...tasks, result.task],
  };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!checkId(id)) {
    return { ok: false, error: "Некорректный id" };
  }

  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть boolean" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) =>
      task.id === id
        ? { ...task, completed }
        : task
    ),
  };
}

export function renameTask(tasks, id, title) {
  if (!checkId(id)) {
    return { ok: false, error: "Некорректный id" };
  }

  const newTitle = checkTitle(title);

  if (newTitle === null) {
    return { ok: false, error: "Некорректное название" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) =>
      task.id === id
        ? { ...task, title: newTitle }
        : task
    ),
  };
}

export function removeTask(tasks, id) {
  if (!checkId(id)) {
    return { ok: false, error: "Некорректный id" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}