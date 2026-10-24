import {
  ApiError,
} from "./api-client.js";


import {
  validateTaskDraft,
} from "./form-validation.js";


export function messageForError(error) {
  if (!(error instanceof ApiError)) {
    return "Не удалось выполнить операцию.";
  }

  if (error.kind === "timeout") {
    return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  }

  if (error.kind === "network") {
    return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  }

  if (
    error.kind ===
    "invalid-response"
  ) {
    return "Сервер вернул ответ неожиданного формата.";
  }

  if (
    error.kind === "http"
    && error.status === 404
  ) {
    return "Запись уже отсутствует на сервере. Обновите список.";
  }

  if (error.kind === "http") {
    return (
      error.message
      || `Сервер вернул ошибку ${error.status}.`
    );
  }

  return "Не удалось выполнить операцию.";
}


export function createAppController({
  api,
  view,
  validateDraft =
    validateTaskDraft,
} = {}) {

  const apiMethods = [
    "loadInitialData",
    "getTasks",
    "createTask",
    "updateTask",
    "setTaskCompleted",
    "deleteTask",
    "resetDemoData",
  ];


  const viewMethods = [
    "setListState",
    "setTasks",
    "setCategories",
    "setTotal",
    "setFormTask",
    "showFormErrors",
    "setMutationPending",
    "notify",
  ];


  if (
    !api
    || apiMethods.some(
      (name) =>
        typeof api[name]
        !== "function"
    )
  ) {
    throw new TypeError(
      "Некорректный api"
    );
  }


  if (
    !view
    || viewMethods.some(
      (name) =>
        typeof view[name]
        !== "function"
    )
  ) {
    throw new TypeError(
      "Некорректный view"
    );
  }


  if (
    typeof validateDraft
    !== "function"
  ) {
    throw new TypeError(
      "validateDraft должен быть функцией"
    );
  }


  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;

  let activeLoadController =
    null;

  let loadSequence = 0;
  let destroyed = false;


  async function loadCurrentTasks() {
    if (destroyed) {
      return;
    }


    if (activeLoadController) {
      activeLoadController.abort();
    }


    const controller =
      new AbortController();


    activeLoadController =
      controller;


    const sequence =
      ++loadSequence;


    view.setListState(
      "loading"
    );


    try {
      let result;


      if (categories.length === 0) {
        result =
          await api.loadInitialData(
            filters,
            {
              signal:
                controller.signal,
            },
          );


        if (
          sequence !== loadSequence
          || destroyed
        ) {
          return;
        }


        categories =
          result.categories;


        view.setCategories(
          categories
        );
      } else {
        result =
          await api.getTasks(
            filters,
            {
              signal:
                controller.signal,
            },
          );


        if (
          sequence !== loadSequence
          || destroyed
        ) {
          return;
        }
      }


      tasks =
        result.tasks;


      view.setTasks(
        tasks,
        categories
      );


      view.setTotal(
        result.meta.total
      );


      view.setListState(
        tasks.length === 0
          ? "empty"
          : "ready"
      );
    } catch (error) {
      if (
        sequence !== loadSequence
        || destroyed
      ) {
        return;
      }


      if (
        error instanceof ApiError
        && error.kind === "aborted"
      ) {
        return;
      }


      view.setListState(
        "error",
        messageForError(error)
      );
    } finally {
      if (
        sequence === loadSequence
        && activeLoadController
          === controller
      ) {
        activeLoadController =
          null;
      }
    }
  }


  async function runMutation(
    action,
    successMessage,
    afterSuccess = null,
  ) {
    view.setMutationPending(
      true
    );


    try {
      await action();


      if (afterSuccess) {
        afterSuccess();
      }


      view.notify(
        successMessage,
        "success"
      );


      await loadCurrentTasks();
    } catch (error) {
      view.notify(
        messageForError(error),
        "error"
      );
    } finally {
      view.setMutationPending(
        false
      );
    }
  }


  async function start(
    initialFilters = {},
  ) {
    filters = {
      ...initialFilters,
    };

    return loadCurrentTasks();
  }


  async function applyFilters(
    newFilters = {},
  ) {
    filters = {
      ...newFilters,
    };

    return loadCurrentTasks();
  }


  async function refresh() {
    return loadCurrentTasks();
  }


  async function submit(draft) {
    const validation =
      validateDraft(
        draft,
        categories
      );


    if (!validation.valid) {
      view.showFormErrors(
        validation.errors
      );

      return;
    }


    view.showFormErrors({});


    if (editingId === null) {
      return runMutation(
        () =>
          api.createTask(
            validation.value
          ),

        "Задача добавлена.",

        () => {
          editingId = null;

          view.setFormTask(
            null
          );
        },
      );
    }


    const id =
      editingId;


    return runMutation(
      () =>
        api.updateTask(
          id,
          validation.value
        ),

      "Задача изменена.",

      () => {
        editingId = null;

        view.setFormTask(
          null
        );
      },
    );
  }


  function beginEdit(id) {
    const task =
      tasks.find(
        (item) =>
          item.id === id
      );


    if (!task) {
      view.notify(
        "Задача не найдена.",
        "error"
      );

      return;
    }


    editingId = id;

    view.showFormErrors({});

    view.setFormTask(
      task
    );
  }


  function cancelEdit() {
    editingId = null;

    view.showFormErrors({});

    view.setFormTask(
      null
    );
  }


  async function toggleTask(id) {
    const task =
      tasks.find(
        (item) =>
          item.id === id
      );


    if (!task) {
      view.notify(
        "Задача не найдена.",
        "error"
      );

      return;
    }


    return runMutation(
      () =>
        api.setTaskCompleted(
          id,
          !task.completed
        ),

      "Статус задачи изменён.",
    );
  }


  async function deleteTask(id) {
    return runMutation(
      () =>
        api.deleteTask(id),

      "Задача удалена.",

      () => {
        if (
          editingId === id
        ) {
          cancelEdit();
        }
      },
    );
  }


  async function resetData() {
    return runMutation(
      () =>
        api.resetDemoData(),

      "Учебные данные восстановлены.",

      () => {
        if (
          editingId !== null
        ) {
          cancelEdit();
        }
      },
    );
  }


  function destroy() {
    destroyed = true;

    loadSequence += 1;

    if (activeLoadController) {
      activeLoadController.abort();

      activeLoadController =
        null;
    }
  }


  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}