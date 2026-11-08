// Load saved tasks from browser
let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

// Save tasks in browser
function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Get deadline timestamp
function getDeadline(task) {

    if (!task.deadline) {
        return null;
    }

    // Support old saved deadline formats
    if (typeof task.deadline === "number") {
        return task.deadline;
    }

    let value = task.deadline;

    // Convert old date-only values to local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value += "T00:00";
    }

    return new Date(value).getTime();
}

// Enable browser notifications
function enableNotifications() {

    if (!("Notification" in window)) {
        alert("Your browser does not support notifications!");
        return;
    }

    Notification.requestPermission().then(function(permission) {

        let status = document.getElementById("notificationStatus");

        if (permission === "granted") {

            status.textContent = "Notifications enabled successfully!";

            checkReminders();

        } else {

            status.textContent = "Please allow notifications in browser settings.";

        }

    });
}

// Display all tasks
function displayTasks() {

    let taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {

        let li = document.createElement("li");

        let details = document.createElement("div");

        details.className = "task-details";

        // Task Name
        let span = document.createElement("span");

        span.className = "task-name";

        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("done");
        }

        // Mark task complete
        span.onclick = function() {

            tasks[index].completed = !tasks[index].completed;

            saveTasks();

            displayTasks();

        };

        details.appendChild(span);

        // Show Deadline
        let deadline = getDeadline(task);

        if (deadline !== null && !Number.isNaN(deadline)) {

            let deadlineText = document.createElement("small");

            deadlineText.className = "deadline-text";

            let deadlineDate = new Date(deadline);

            deadlineText.textContent =
                "Deadline: " +
                deadlineDate.toLocaleDateString() +
                " | Time: " +
                deadlineDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            details.appendChild(deadlineText);

            // Task Status
            let status = document.createElement("small");

            status.className = "task-status";

            if (task.completed) {

                status.textContent = "Completed";

                status.classList.add("completed-status");

            } else {

                let remaining = deadline - Date.now();

                if (remaining <= 0) {

                    status.textContent = "Overdue";

                    status.classList.add("overdue");

                } else {

                    status.textContent =
                        "Time Left: " + formatTime(remaining);

                    status.classList.add("upcoming");

                }

            }

            details.appendChild(status);

        }

        // Delete Button
        let deleteBtn = document.createElement("button");

        deleteBtn.textContent = "Delete";

        deleteBtn.className = "delete";

        deleteBtn.onclick = function() {

            tasks.splice(index, 1);

            saveTasks();

            displayTasks();

        };

        li.appendChild(details);

        li.appendChild(deleteBtn);

        taskList.appendChild(li);

    });

    updateSummary();

}

// Format remaining time
function formatTime(milliseconds) {

    let totalMinutes = Math.floor(milliseconds / 60000);

    let days = Math.floor(totalMinutes / 1440);

    let hours = Math.floor((totalMinutes % 1440) / 60);

    let minutes = totalMinutes % 60;

    return days + "d " + hours + "h " + minutes + "m";

}

// Add new task
function addTask() {

    let input = document.getElementById("taskInput");

    let dateInput = document.getElementById("taskDeadline");

    let timeInput = document.getElementById("taskTime");

    let task = input.value.trim();

    let date = dateInput.value;

    let time = timeInput.value;

    if (task === "") {

        alert("Please enter a task!");

        return;

    }

    // Date and time must be selected together
    if ((date && !time) || (!date && time)) {

        alert("Please select both deadline date and time!");

        return;

    }

    let deadline = null;

    if (date && time) {

        deadline = new Date(date + "T" + time).getTime();

        if (Number.isNaN(deadline) || deadline <= Date.now()) {

            alert("Please select a valid future deadline!");

            return;

        }

    }

    // Add task to array
    tasks.push({

        text: task,

        completed: false,

        deadline: deadline,

        reminderSent: false

    });

    saveTasks();

    displayTasks();

    // Clear input fields
    input.value = "";

    dateInput.value = "";

    timeInput.value = "";

    // Check reminder for new task
    checkReminders();

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

// Check task reminders
function checkReminders() {

    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    tasks.forEach(function(task) {

        let deadline = getDeadline(task);

        if (
            deadline === null ||
            Number.isNaN(deadline) ||
            task.completed ||
            task.reminderSent
        ) {
            return;
        }

        let remaining = deadline - Date.now();

        // Reminder one hour before deadline
        if (remaining <= 60 * 60 * 1000 && remaining > 0) {

            new Notification("Task Reminder!", {

                body: task.text + " is due within one hour."

            });

            task.reminderSent = true;

            saveTasks();

        }

    });

}

// Display saved tasks when page opens
displayTasks();

// Check reminders every 30 seconds
setInterval(function() {

    checkReminders();

    displayTasks();

}, 30000);

// Check reminders when user returns to website
document.addEventListener("visibilitychange", function() {

    if (!document.hidden) {

        checkReminders();

        displayTasks();

    }

});
