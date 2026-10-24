import { ApiError } from "./api-client.js";


const ALLOWED_PRIORITIES =
  new Set([
    "low",
    "medium",
    "high",
  ]);


const ALLOWED_FILTERS =
  new Set([
    "completed",
    "priority",
    "categoryId",
    "q",
  ]);


function invalidResponse(message) {
  return new ApiError(
    message,
    {
      kind: "invalid-response",
    },
  );
}


function isPositiveSafeInteger(value) {
  return (
    Number.isSafeInteger(value)
    && value > 0
  );
}


export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && !Array.isArray(value)
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(
      value.priority
    )
    && isPositiveSafeInteger(
      value.categoryId
    )
  );
}


export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && !Array.isArray(value)
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100
  );
}


function hasUniqueIds(items) {
  const ids = new Set();

  for (const item of items) {
    if (ids.has(item.id)) {
      return false;
    }

    ids.add(item.id);
  }

  return true;
}


function normalizeFilters(filters = {}) {
  if (
    filters === null
    || typeof filters !== "object"
    || Array.isArray(filters)
  ) {
    throw new TypeError(
      "filters должен быть объектом"
    );
  }


  for (
    const name
    of Object.keys(filters)
  ) {
    if (!ALLOWED_FILTERS.has(name)) {
      throw new TypeError(
        `Неизвестный фильтр: ${name}`
      );
    }
  }


  const result = {};


  if (
    filters.completed !== undefined
  ) {
    if (
      typeof filters.completed
      !== "boolean"
    ) {
      throw new TypeError(
        "completed должен быть boolean"
      );
    }

    result.completed =
      filters.completed;
  }


  if (
    filters.priority !== undefined
  ) {
    if (
      !ALLOWED_PRIORITIES.has(
        filters.priority
      )
    ) {
      throw new TypeError(
        "Некорректный priority"
      );
    }

    result.priority =
      filters.priority;
  }


  if (
    filters.categoryId !== undefined
  ) {
    if (
      !isPositiveSafeInteger(
        filters.categoryId
      )
    ) {
      throw new TypeError(
        "categoryId должен быть положительным целым числом"
      );
    }

    result.categoryId =
      filters.categoryId;
  }


  if (filters.q !== undefined) {
    if (
      typeof filters.q !== "string"
    ) {
      throw new TypeError(
        "q должен быть строкой"
      );
    }

    const q =
      filters.q.trim();

    if (q.length > 100) {
      throw new TypeError(
        "q должен содержать не более 100 символов"
      );
    }

    result.q = q;
  }


  return result;
}


function checkTaskCollection(payload) {
  if (
    payload === null
    || typeof payload !== "object"
    || Array.isArray(payload)
    || !Array.isArray(payload.data)
    || payload.meta === null
    || typeof payload.meta !== "object"
    || Array.isArray(payload.meta)
  ) {
    throw invalidResponse(
      "Некорректный список задач."
    );
  }


  if (!payload.data.every(isTask)) {
    throw invalidResponse(
      "Ответ содержит некорректную задачу."
    );
  }


  if (!hasUniqueIds(payload.data)) {
    throw invalidResponse(
      "В ответе повторяются id задач."
    );
  }


  if (
    !Number.isSafeInteger(
      payload.meta.total
    )
    || payload.meta.total < 0
    || payload.meta.total
      !== payload.data.length
  ) {
    throw invalidResponse(
      "Некорректное meta.total."
    );
  }


  return {
    tasks: payload.data,
    meta: payload.meta,
  };
}


function checkCategories(payload) {
  if (
    payload === null
    || typeof payload !== "object"
    || Array.isArray(payload)
    || !Array.isArray(payload.data)
    || payload.meta === null
    || typeof payload.meta !== "object"
  ) {
    throw invalidResponse(
      "Некорректный список категорий."
    );
  }


  if (
    !payload.data.every(isCategory)
  ) {
    throw invalidResponse(
      "Ответ содержит некорректную категорию."
    );
  }


  if (!hasUniqueIds(payload.data)) {
    throw invalidResponse(
      "В ответе повторяются id категорий."
    );
  }


  if (
    !Number.isSafeInteger(
      payload.meta.total
    )
    || payload.meta.total < 0
    || payload.meta.total
      !== payload.data.length
  ) {
    throw invalidResponse(
      "Некорректное meta.total категорий."
    );
  }


  return payload.data;
}


function checkSingleTask(payload) {
  if (
    payload === null
    || typeof payload !== "object"
    || !isTask(payload.data)
  ) {
    throw invalidResponse(
      "Сервер вернул некорректную задачу."
    );
  }

  return payload.data;
}


function signalOptions(options = {}) {
  return options.signal === undefined
    ? {}
    : { signal: options.signal };
}


export function createTaskApi(client) {
  if (
    !client
    || typeof client.requestJson
      !== "function"
  ) {
    throw new TypeError(
      "client.requestJson должен быть функцией"
    );
  }


  async function getTasks(
    filters = {},
    options = {},
  ) {
    const query =
      normalizeFilters(filters);

    const payload =
      await client.requestJson(
        "/tasks",
        {
          query,
          ...signalOptions(options),
        },
      );

    return checkTaskCollection(
      payload
    );
  }


  async function getTaskById(
    id,
    options = {},
  ) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError(
        "Некорректный id задачи"
      );
    }

    const payload =
      await client.requestJson(
        `/tasks/${id}`,
        signalOptions(options),
      );

    return checkSingleTask(payload);
  }


  async function getCategories(
    options = {},
  ) {
    const payload =
      await client.requestJson(
        "/categories",
        signalOptions(options),
      );

    return checkCategories(payload);
  }


  async function loadInitialData(
    filters = {},
    options = {},
  ) {
    const tasksPromise =
      getTasks(filters, options);

    const categoriesPromise =
      getCategories(options);


    const [
      taskResult,
      categories,
    ] = await Promise.all([
      tasksPromise,
      categoriesPromise,
    ]);


    return {
      tasks: taskResult.tasks,
      categories,
      meta: taskResult.meta,
    };
  }


  async function createTask(
    draft,
    options = {},
  ) {
    const payload =
      await client.requestJson(
        "/tasks",
        {
          method: "POST",
          body: draft,
          ...signalOptions(options),
        },
      );

    return checkSingleTask(payload);
  }


  async function updateTask(
    id,
    changes,
    options = {},
  ) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError(
        "Некорректный id задачи"
      );
    }

    const payload =
      await client.requestJson(
        `/tasks/${id}`,
        {
          method: "PATCH",
          body: changes,
          ...signalOptions(options),
        },
      );

    return checkSingleTask(payload);
  }


  async function setTaskCompleted(
    id,
    completed,
    options = {},
  ) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError(
        "Некорректный id задачи"
      );
    }

    if (
      typeof completed !== "boolean"
    ) {
      throw new TypeError(
        "completed должен быть boolean"
      );
    }

    const payload =
      await client.requestJson(
        `/tasks/${id}`,
        {
          method: "PATCH",
          body: {
            completed,
          },
          ...signalOptions(options),
        },
      );

    return checkSingleTask(payload);
  }


  async function deleteTask(
    id,
    options = {},
  ) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError(
        "Некорректный id задачи"
      );
    }

    const result =
      await client.requestJson(
        `/tasks/${id}`,
        {
          method: "DELETE",
          ...signalOptions(options),
        },
      );


    if (result !== null) {
      throw invalidResponse(
        "DELETE должен вернуть пустой ответ."
      );
    }


    return null;
  }


  async function resetDemoData(
    options = {},
  ) {
    const payload =
      await client.requestJson(
        "/debug/reset",
        {
          method: "POST",
          ...signalOptions(options),
        },
      );


    const data =
      payload?.data;


    if (
      !data
      || data.reset !== true
      || !Number.isSafeInteger(
        data.total
      )
      || data.total < 0
    ) {
      throw invalidResponse(
        "Некорректный ответ reset."
      );
    }


    return data;
  }


  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}