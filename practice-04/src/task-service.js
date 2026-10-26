const ALLOWED_PRIORITIES = [
  "low",
  "medium",
  "high",
];


function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}


function normalizeTitle(title) {
  if (typeof title !== "string") {
    return null;
  }

  const normalized = title.trim();

  if (
    normalized.length < 1 ||
    normalized.length > 100
  ) {
    return null;
  }

  return normalized;
}


function isValidPriority(priority) {
  return ALLOWED_PRIORITIES.includes(priority);
}


export function createTask(
  id,
  title,
  priority = "medium"
) {
  if (!isValidId(id)) {
    return {
      ok: false,
      error: "Некорректный id",
    };
  }

  const normalizedTitle =
    normalizeTitle(title);

  if (normalizedTitle === null) {
    return {
      ok: false,
      error: "Некорректное название",
    };
  }

  if (!isValidPriority(priority)) {
    return {
      ok: false,
      error: "Некорректный приоритет",
    };
  }

  return {
    ok: true,
    task: {
      id,
      title: normalizedTitle,
      completed: false,
      priority,
    },
  };
}


export function findTaskById(tasks, id) {
  return tasks.find(
    (task) => task.id === id
  );
}


export function getPendingTasks(tasks) {
  return tasks.filter(
    (task) => task.completed === false
  );
}


export function getTaskTitles(tasks) {
  return tasks.map(
    (task) => task.title
  );
}


export function getTaskStats(tasks) {
  const total = tasks.length;

  let completed = 0;

  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }

  const pending = total - completed;

  const progress =
    total === 0
      ? 0
      : (completed / total) * 100;

  return {
    total,
    completed,
    pending,
    progress,
  };
}


export function addTask(
  tasks,
  id,
  title,
  priority = "medium"
) {
  const created =
    createTask(id, title, priority);

  if (!created.ok) {
    return created;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return {
      ok: false,
      error: "Такой id уже существует",
    };
  }

  return {
    ok: true,
    tasks: [
      ...tasks,
      created.task,
    ],
  };
}


export function setTaskCompleted(
  tasks,
  id,
  completed
) {
  if (!isValidId(id)) {
    return {
      ok: false,
      error: "Некорректный id",
    };
  }

  if (typeof completed !== "boolean") {
    return {
      ok: false,
      error: "completed должен быть boolean",
    };
  }

  if (findTaskById(tasks, id) === undefined) {
    return {
      ok: false,
      error: "Задача не найдена",
    };
  }

  return {
    ok: true,

    tasks: tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed,
          }
        : task
    ),
  };
}


export function renameTask(
  tasks,
  id,
  title
) {
  if (!isValidId(id)) {
    return {
      ok: false,
      error: "Некорректный id",
    };
  }

  const normalizedTitle =
    normalizeTitle(title);

  if (normalizedTitle === null) {
    return {
      ok: false,
      error: "Некорректное название",
    };
  }

  if (findTaskById(tasks, id) === undefined) {
    return {
      ok: false,
      error: "Задача не найдена",
    };
  }

  return {
    ok: true,

    tasks: tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: normalizedTitle,
          }
        : task
    ),
  };
}


export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return {
      ok: false,
      error: "Некорректный id",
    };
  }

  if (findTaskById(tasks, id) === undefined) {
    return {
      ok: false,
      error: "Задача не найдена",
    };
  }

  return {
    ok: true,

    tasks: tasks.filter(
      (task) => task.id !== id
    ),
  };
}


export function updateTask(
  tasks,
  id,
  title,
  priority
) {
  if (!isValidId(id)) {
    return {
      ok: false,
      error: "Некорректный id",
    };
  }

  if (findTaskById(tasks, id) === undefined) {
    return {
      ok: false,
      error: "Задача не найдена",
    };
  }

  const normalizedTitle =
    normalizeTitle(title);

  if (normalizedTitle === null) {
    return {
      ok: false,
      error: "Некорректное название",
    };
  }

  if (!isValidPriority(priority)) {
    return {
      ok: false,
      error: "Некорректный приоритет",
    };
  }

  return {
    ok: true,

    tasks: tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: normalizedTitle,
            priority,
          }
        : task
    ),
  };
}