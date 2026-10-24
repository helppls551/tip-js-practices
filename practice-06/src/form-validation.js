const ALLOWED_PRIORITIES =
  new Set([
    "low",
    "medium",
    "high",
  ]);


export function validateTaskDraft(
  draft,
  categories,
) {
  const errors = {};


  const title =
    typeof draft?.title === "string"
      ? draft.title.trim()
      : "";


  if (
    title.length < 1
    || title.length > 100
  ) {
    errors.title =
      "Название должно содержать от 1 до 100 символов.";
  }


  const priority =
    draft?.priority;


  if (
    !ALLOWED_PRIORITIES.has(priority)
  ) {
    errors.priority =
      "Выберите допустимый приоритет.";
  }


  const categoryId =
    Number(draft?.categoryId);


  const categoryExists =
    Number.isSafeInteger(categoryId)
    && categoryId > 0
    && Array.isArray(categories)
    && categories.some(
      (category) =>
        category.id === categoryId
    );


  if (!categoryExists) {
    errors.categoryId =
      "Выберите существующую категорию.";
  }


  const value = {
    title,
    priority,
    categoryId,
  };


  return {
    valid:
      Object.keys(errors).length === 0,

    value,

    errors,
  };
}