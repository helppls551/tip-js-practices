import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES =
  new Set(["low", "medium", "high"]);

const ALLOWED_FILTERS =
  new Set(["completed", "priority", "categoryId", "q"]);


function invalidResponse(message) {
  return new ApiError(message, {
    kind: "invalid-response",
  });
}


function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}


function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId)
  );
}


function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
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
    throw new TypeError("filters должен быть объектом");
  }

  for (const name of Object.keys(filters)) {
    if (!ALLOWED_FILTERS.has(name)) {
      throw new TypeError(`Неизвестный фильтр: ${name}`);
    }
  }

  const result = {};


  if (filters.completed !== undefined) {
    if (typeof filters.completed !== "boolean") {
      throw new TypeError("completed должен быть boolean");
    }

    result.completed = filters.completed;
  }


  if (filters.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.has(filters.priority)) {
      throw new TypeError("Некорректный priority");
    }

    result.priority = filters.priority;
  }


  if (filters.categoryId !== undefined) {
    if (!isPositiveSafeInteger(filters.categoryId)) {
      throw new TypeError(
        "categoryId должен быть положительным целым числом"
      );
    }

    result.categoryId = filters.categoryId;
  }


  if (filters.q !== undefined) {
    if (typeof filters.q !== "string") {
      throw new TypeError("q должен быть строкой");
    }

    const q = filters.q.trim();

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
    !payload
    || typeof payload !== "object"
    || !Array.isArray(payload.data)
    || !payload.meta
    || typeof payload.meta !== "object"
  ) {
    throw invalidResponse(
      "Некорректная коллекция задач"
    );
  }


  if (!payload.data.every(isTask)) {
    throw invalidResponse(
      "Некорректная задача в ответе"
    );
  }


  if (!hasUniqueIds(payload.data)) {
    throw invalidResponse(
      "Повторяющиеся id задач"
    );
  }


  if (
    !Number.isSafeInteger(payload.meta.total)
    || payload.meta.total < 0
    || payload.meta.total !== payload.data.length
  ) {
    throw invalidResponse(
      "Некорректное meta.total"
    );
  }


  if (
    !payload.meta.filters
    || typeof payload.meta.filters !== "object"
    || Array.isArray(payload.meta.filters)
  ) {
    throw invalidResponse(
      "Некорректные meta.filters"
    );
  }


  return {
    tasks: payload.data,
    meta: payload.meta,
  };
}


function checkCategories(payload) {
  if (
    !payload
    || typeof payload !== "object"
    || !Array.isArray(payload.data)
    || !payload.meta
    || typeof payload.meta !== "object"
  ) {
    throw invalidResponse(
      "Некорректная коллекция категорий"
    );
  }


  if (!payload.data.every(isCategory)) {
    throw invalidResponse(
      "Некорректная категория"
    );
  }


  if (!hasUniqueIds(payload.data)) {
    throw invalidResponse(
      "Повторяющиеся id категорий"
    );
  }


  if (
    !Number.isSafeInteger(payload.meta.total)
    || payload.meta.total !== payload.data.length
  ) {
    throw invalidResponse(
      "Некорректное meta.total категорий"
    );
  }


  return payload.data;
}


export function createTaskApi(client) {
  if (
    !client
    || typeof client.requestJson !== "function"
  ) {
    throw new TypeError(
      "client.requestJson должен быть функцией"
    );
  }


  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);

    const payload =
      await client.requestJson("/tasks", {
        query,
      });

    return checkTaskCollection(payload);
  }


  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError(
        "id должен быть положительным целым числом"
      );
    }

    const payload =
      await client.requestJson(`/tasks/${id}`);

    if (
      !payload
      || typeof payload !== "object"
      || !isTask(payload.data)
    ) {
      throw invalidResponse(
        "Некорректная задача"
      );
    }

    return payload.data;
  }


  async function getCategories() {
    const payload =
      await client.requestJson("/categories");

    return checkCategories(payload);
  }


  async function loadInitialData(filters = {}) {
    const tasksPromise =
      getTasks(filters);

    const categoriesPromise =
      getCategories();

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


  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
  };
}