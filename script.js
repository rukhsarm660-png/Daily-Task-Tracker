
// Load saved tasks from browser
let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

// Save tasks in browser
function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Display all tasks
function displayTasks() {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {
        let li = document.createElement("li");
        let span = document.createElement("span");

        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("done");
        }

        span.onclick = function() {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            displayTasks();
        };

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete";

        deleteBtn.onclick = function() {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });

    updateSummary();
}

// Add new task
function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value.trim();

    if (task === "") {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        text: task,
        completed: false
    });

    saveTasks();
    displayTasks();

    input.value = "";
}

// Update task counter

function updateSummary() {
    document.getElementById("total").textContent = tasks.length;

    let completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    document.getElementById("completed").textContent = completed;

    let percentage = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% Completed";
}


// Show saved tasks when page opens
displayTasks();
