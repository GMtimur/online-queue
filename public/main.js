// Массив для хранения очереди
let queue = [];
let confirmedUsers = new Set(); // Хранение подтвержденных пользователей
const userTimers = {}; // Таймеры для удаления неподтвержденных пользователей

// Проверка состояния в localStorage
const userInQueueKey = "userInQueue";
if (localStorage.getItem(userInQueueKey)) {
  alert("Вы уже состоите в очереди с этого устройства.");
}

// Элементы DOM
const form = document.getElementById("getForm");
const dataInput = document.getElementById("dataInput");
const queueDisplay = document.createElement("div");
const actionButton = document.createElement("button");

// Настройка кнопки
actionButton.style.marginTop = "20px";
actionButton.textContent = "Встать в очередь"; // Начальный текст кнопки
actionButton.disabled = false; // Кнопка активна с самого начала

// Добавление отображения очереди
queueDisplay.style.marginTop = "20px";
queueDisplay.style.textAlign = "center";
queueDisplay.style.color = "#fff";
document.querySelector(".wrapper").appendChild(queueDisplay);
document.querySelector(".wrapper").appendChild(actionButton);

// Функция для отображения списка имён в очереди
function renderQueueList() {
  queueDisplay.innerHTML = ""; // Очистить текущее содержимое

  if (queue.length === 0) {
    queueDisplay.textContent = "Очередь пуста";
  } else {
    const list = document.createElement("ul");
    list.style.listStyleType = "none";
    list.style.padding = "0";

    queue.forEach((name, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${index + 1}. ${name}`;
      listItem.style.margin = "5px 0";
      list.appendChild(listItem);
    });

    queueDisplay.appendChild(list);
  }
}

// Функция для удаления пользователя после тайм-аута
function removeUserAfterTimeout(user) {
  if (userTimers[user]) {
    clearTimeout(userTimers[user]);
  }

  userTimers[user] = setTimeout(() => {
    const index = queue.indexOf(user);
    if (index !== -1 && !confirmedUsers.has(user)) {
      queue.splice(index, 1);
      localStorage.removeItem(userInQueueKey); // Удалить из localStorage
      renderQueueList();
      alert(`${user} был удален из очереди за неподтверждение.`);
    }
  }, 60000); // Удаление через 1 минуту
}

// Функция для подтверждения очереди, которая активируется, когда пользователь становится первым
function confirmQueue(userData) {
  if (queue[0] === userData) {
    // Если это первый в очереди
    const confirm = window.confirm(
      `${userData}, подтвердите ваше место в очереди.`
    );
    if (confirm) {
      confirmedUsers.add(userData);
      clearTimeout(userTimers[userData]); // Удалить таймер, если подтверждено
    } else {
      const index = queue.indexOf(userData);
      if (index !== -1) {
        queue.splice(index, 1);
        localStorage.removeItem(userInQueueKey); // Удалить из localStorage
        renderQueueList();
        alert(`${userData} был удален из очереди за неподтверждение.`);
      }
    }
  }
}

// Функция для обновления текста кнопки в зависимости от состояния
function updateButtonState() {
  const userData = localStorage.getItem(userInQueueKey);

  if (userData) {
    if (queue[0] === userData && !confirmedUsers.has(userData)) {
      actionButton.textContent = "Подтвердить очередь"; // Когда пользователь первый
    } else {
      actionButton.textContent = "Выйти из очереди"; // Когда пользователь в очереди, но не первый
    }
  } else {
    actionButton.textContent = "Встать в очередь"; // Когда пользователь не в очереди
  }
}

// Обработчик отправки формы
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Отмена стандартного поведения формы

  const userData = dataInput.value.trim();
  if (!userData) {
    alert("Введите ваше имя и группу!");
    return;
  }

  if (localStorage.getItem(userInQueueKey)) {
    alert("Вы уже состоите в очереди с этого устройства!");
    return;
  }

  if (queue.includes(userData)) {
    alert("Это имя уже в очереди!");
    return;
  }

  queue.push(userData); // Добавление пользователя в очередь
  localStorage.setItem(userInQueueKey, userData); // Сохранить факт участия
  removeUserAfterTimeout(userData); // Установить таймер на подтверждение
  dataInput.value = ""; // Очистка поля ввода
  renderQueueList();
  updateButtonState(); // Обновить состояние кнопки
});

// Обработчик кнопки
actionButton.addEventListener("click", () => {
  const userData = localStorage.getItem(userInQueueKey);

  if (userData) {
    if (queue[0] === userData && !confirmedUsers.has(userData)) {
      // Подтверждение очереди
      confirmQueue(userData);
      updateButtonState(); // Обновление кнопки после подтверждения
    } else {
      // Выход из очереди
      const index = queue.indexOf(userData);
      if (index !== -1) {
        queue.splice(index, 1);
        localStorage.removeItem(userInQueueKey); // Удалить из localStorage
        renderQueueList();
        updateButtonState(); // Обновить состояние кнопки после выхода
      }
    }
  } else {
    // Вставка в очередь
    const userData = dataInput.value.trim();
    if (!userData) {
      alert("Введите ваше имя и группу!");
      return;
    }
    queue.push(userData); // Добавление пользователя в очередь
    localStorage.setItem(userInQueueKey, userData); // Сохранить факт участия
    removeUserAfterTimeout(userData); // Установить таймер на подтверждение
    dataInput.value = ""; // Очистка поля ввода
    renderQueueList();
    updateButtonState(); // Обновить состояние кнопки после вставки в очередь
  }
});

// Инициализация
renderQueueList();
updateButtonState(); // Инициализируем состояние кнопки
