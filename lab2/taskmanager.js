const tasks = [];

let currentColumn = '';
let editingTaskId = null;

const taskCounter = document.getElementById('taskCounter');
const priorityFilter = document.getElementById('priorityFilter');

const todoList = document.getElementById('todoList');
const inprogressList = document.getElementById('inprogressList');
const doneList = document.getElementById('doneList');

const addTaskButtons = document.querySelectorAll('.add-task-btn');
const clearDoneBtn = document.getElementById('clearDoneBtn');

const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDueDateInput = document.getElementById('taskDueDate');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

function openModal(columnId) {
  currentColumn = columnId;
  taskModal.classList.remove('hidden');
}

function closeModal() {
  taskModal.classList.add('hidden');
  taskForm.reset();
  editingTaskId = null;
  modalTitle.textContent = 'Add Task';
}

function updateTaskCounter() {
  taskCounter.textContent = 'Total Tasks: ' + tasks.length;
}

function createTaskCard(taskObj) {
  const li = document.createElement('li');
  li.classList.add('task-card');
  li.setAttribute('data-id', taskObj.id);
  li.setAttribute('data-priority', taskObj.priority);

  const title = document.createElement('h3');
  title.classList.add('task-title');
  title.setAttribute('data-id', taskObj.id);
  title.textContent = taskObj.title;

  const description = document.createElement('p');
  description.textContent = taskObj.description;

  const meta = document.createElement('div');
  meta.classList.add('task-meta');

  let dueText = taskObj.dueDate;
  if (dueText === '') {
    dueText = 'No due date';
  }

  meta.textContent = 'Priority: ' + taskObj.priority + ' | Due: ' + dueText;

  const actions = document.createElement('div');
  actions.classList.add('task-actions');

  const editBtn = document.createElement('button');
  editBtn.classList.add('edit-btn');
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', taskObj.id);
  editBtn.textContent = 'Edit';

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', taskObj.id);
  deleteBtn.textContent = 'Delete';

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(title);
  li.appendChild(description);
  li.appendChild(meta);
  li.appendChild(actions);

  return li;
}

function addTask(columnId, taskObj) {
  const taskCard = createTaskCard(taskObj);

  if (columnId === 'todo') {
    todoList.appendChild(taskCard);
  } else if (columnId === 'inprogress') {
    inprogressList.appendChild(taskCard);
  } else if (columnId === 'done') {
    doneList.appendChild(taskCard);
  }
}

function renderTasks() {
  todoList.textContent = '';
  inprogressList.textContent = '';
  doneList.textContent = '';

  tasks.forEach(function(task) {
    addTask(task.column, task);
  });

  applyPriorityFilter();
  updateTaskCounter();
}

function deleteTask(taskId) {
  const taskElement = document.querySelector('.task-card[data-id="' + taskId + '"]');

  if (!taskElement) {
    return;
  }

  taskElement.classList.add('fade-out');

  setTimeout(function() {
    const taskIndex = tasks.findIndex(function(task) {
      return task.id === taskId;
    });

    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }

    taskElement.remove();
    updateTaskCounter();
  }, 300);
}

function editTask(taskId) {
  const taskToEdit = tasks.find(function(task) {
    return task.id === taskId;
  });

  if (!taskToEdit) {
    return;
  }

  editingTaskId = taskId;
  currentColumn = taskToEdit.column;

  modalTitle.textContent = 'Edit Task';
  taskTitleInput.value = taskToEdit.title;
  taskDescriptionInput.value = taskToEdit.description;
  taskPriorityInput.value = taskToEdit.priority;
  taskDueDateInput.value = taskToEdit.dueDate;

  taskModal.classList.remove('hidden');
}

function updateTask(taskId, updatedData) {
  const taskIndex = tasks.findIndex(function(task) {
    return task.id === taskId;
  });

  if (taskIndex === -1) {
    return;
  }

  tasks[taskIndex].title = updatedData.title;
  tasks[taskIndex].description = updatedData.description;
  tasks[taskIndex].priority = updatedData.priority;
  tasks[taskIndex].dueDate = updatedData.dueDate;

  renderTasks();
}

function handleTaskActions(e) {
  const action = e.target.getAttribute('data-action');
  const taskId = e.target.getAttribute('data-id');

  if (!action || !taskId) {
    return;
  }

  if (action === 'delete') {
    deleteTask(taskId);
  } else if (action === 'edit') {
    editTask(taskId);
  }
}

function handleTitleEdit(e) {
  if (!e.target.classList.contains('task-title')) {
    return;
  }

  const titleElement = e.target;
  const taskId = titleElement.getAttribute('data-id');
  const oldTitle = titleElement.textContent;

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.value = oldTitle;
  input.classList.add('inline-edit-input');

  titleElement.replaceWith(input);
  input.focus();

  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      saveInlineEdit(taskId, input);
    }
  });

  input.addEventListener('blur', function() {
    saveInlineEdit(taskId, input);
  });
}

function saveInlineEdit(taskId, inputElement) {
  const newTitle = inputElement.value.trim();

  const task = tasks.find(function(item) {
    return item.id === taskId;
  });

  if (!task) {
    return;
  }

  if (newTitle !== '') {
    task.title = newTitle;
  }

  renderTasks();
}

function applyPriorityFilter() {
  const selectedPriority = priorityFilter.value;
  const allTaskCards = document.querySelectorAll('.task-card');

  allTaskCards.forEach(function(card) {
    const cardPriority = card.getAttribute('data-priority');
    const shouldHide = selectedPriority !== 'all' && cardPriority !== selectedPriority;

    card.classList.toggle('is-hidden', shouldHide);
  });
}

function clearDoneTasks() {
  const doneTasks = tasks.filter(function(task) {
    return task.column === 'done';
  });

  doneTasks.forEach(function(task, index) {
    const taskElement = document.querySelector('.task-card[data-id="' + task.id + '"]');

    if (!taskElement) {
      return;
    }

    setTimeout(function() {
      taskElement.classList.add('fade-out');

      setTimeout(function() {
        const taskIndex = tasks.findIndex(function(item) {
          return item.id === task.id;
        });

        if (taskIndex !== -1) {
          tasks.splice(taskIndex, 1);
        }

        taskElement.remove();
        updateTaskCounter();
      }, 300);
    }, index * 100);
  });
}

addTaskButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const columnId = button.getAttribute('data-column');
    openModal(columnId);
  });
});

cancelTaskBtn.addEventListener('click', function() {
  closeModal();
});

taskForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const titleValue = taskTitleInput.value.trim();
  const descriptionValue = taskDescriptionInput.value.trim();
  const priorityValue = taskPriorityInput.value;
  const dueDateValue = taskDueDateInput.value;

  if (titleValue === '') {
    return;
  }

  if (editingTaskId) {
    const updatedData = {
      title: titleValue,
      description: descriptionValue,
      priority: priorityValue,
      dueDate: dueDateValue
    };

    updateTask(editingTaskId, updatedData);
  } else {
    const newTask = {
      id: 'task-' + Date.now(),
      title: titleValue,
      description: descriptionValue,
      priority: priorityValue,
      dueDate: dueDateValue,
      column: currentColumn
    };

    tasks.push(newTask);
    renderTasks();
  }

  closeModal();
});

priorityFilter.addEventListener('change', function() {
  applyPriorityFilter();
});

clearDoneBtn.addEventListener('click', function() {
  clearDoneTasks();
});

todoList.addEventListener('click', handleTaskActions);
inprogressList.addEventListener('click', handleTaskActions);
doneList.addEventListener('click', handleTaskActions);

todoList.addEventListener('dblclick', handleTitleEdit);
inprogressList.addEventListener('dblclick', handleTitleEdit);
doneList.addEventListener('dblclick', handleTitleEdit);