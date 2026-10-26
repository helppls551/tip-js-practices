const ALLOWED_PRIORITIES =
  new Set([
    "low",
    "medium",
    "high",
  ]);


export function validateTaskDraft(
  draft,
  tasks,
  editingId = null
) {
  const errors = {};

  let id;


  // ID
  if (editingId === null) {
    const rawId = draft.id;

    if (
      rawId === "" ||
      rawId === null ||
      rawId === undefined
    ) {
      errors.id =
        "Введите идентификатор";
    } else {
      id = Number(rawId);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0
      ) {
        errors.id =
          "Id должен быть положительным целым числом";
      } else if (
        tasks.some(
          (task) => task.id === id
        )
      ) {
        errors.id =
          "Такой id уже существует";
      }
    }
  } else {
    id = editingId;

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      errors.id =
        "Некорректный id";
    } else if (
      !tasks.some(
        (task) => task.id === id
      )
    ) {
      errors.id =
        "Редактируемая задача не найдена";
    }
  }


  // TITLE
  let title = "";

  if (typeof draft.title !== "string") {
    errors.title =
      "Название должно быть строкой";
  } else {
    title = draft.title.trim();

    if (
      title.length < 1 ||
      title.length > 100
    ) {
      errors.title =
        "Название должно содержать от 1 до 100 символов";
    }
  }


  // PRIORITY
  const priority = draft.priority;

  if (
    !ALLOWED_PRIORITIES.has(priority)
  ) {
    errors.priority =
      "Некорректный приоритет";
  }


  if (
    Object.keys(errors).length > 0
  ) {
    return {
      ok: false,
      errors,
    };
  }


  return {
    ok: true,

    value: {
      id,
      title,
      priority,
    },
  };
}