
const PRIORITY_LABELS =
  Object.freeze({
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  });


export function createTaskElement(
  task,
  category,
) {
  const card =
    document.createElement("li");


  card.classList.add(
    "task-card"
  );


  card.dataset.taskId =
    String(task.id);


  if (task.completed) {
    card.classList.add(
      "is-completed"
    );
  }


  const title =
    document.createElement("h3");

  title.classList.add(
    "task-title"
  );

  title.textContent =
    task.title;


  const status =
    document.createElement("p");

  status.classList.add(
    "task-status"
  );

  status.textContent =
    task.completed
      ? "Выполнена"
      : "В работе";


  const priority =
    document.createElement("p");

  priority.classList.add(
    "task-priority"
  );

  priority.textContent =
    `Приоритет: ${
      PRIORITY_LABELS[
        task.priority
      ]
    }`;


  const categoryElement =
    document.createElement("p");

  categoryElement.classList.add(
    "task-category"
  );

  categoryElement.textContent =
    category?.name
      ?? "Категория не найдена";


  const actions =
    document.createElement("div");

  actions.classList.add(
    "task-actions"
  );


  const toggleButton =
    document.createElement("button");

  toggleButton.type =
    "button";

  toggleButton.dataset.action =
    "toggle";


  const toggleLabel =
    document.createElement("span");

  toggleLabel.classList.add(
    "action-label"
  );

  toggleLabel.textContent =
    task.completed
      ? "Вернуть в работу"
      : "Выполнить";

  toggleButton.append(
    toggleLabel
  );


  const editButton =
    document.createElement("button");

  editButton.type =
    "button";

  editButton.dataset.action =
    "edit";


  const editLabel =
    document.createElement("span");

  editLabel.classList.add(
    "action-label"
  );

  editLabel.textContent =
    "Изменить";

  editButton.append(
    editLabel
  );


  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.dataset.action =
    "delete";


  const deleteLabel =
    document.createElement("span");

  deleteLabel.classList.add(
    "action-label"
  );

  deleteLabel.textContent =
    "Удалить";

  deleteButton.append(
    deleteLabel
  );


  actions.append(
    toggleButton,
    editButton,
    deleteButton
  );


  card.append(
    title,
    status,
    priority,
    categoryElement,
    actions
  );


  return card;
}


export function renderTaskList(
  list,
  tasks,
  categories,
) {
  const categoriesById =
    new Map(
      categories.map(
        (category) => [
          category.id,
          category,
        ],
      ),
    );


  const cards =
    tasks.map(
      (task) =>
        createTaskElement(
          task,
          categoriesById.get(
            task.categoryId
          ),
        ),
    );


  list.replaceChildren(
    ...cards
  );
}