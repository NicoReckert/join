const BASE_URL = "https://join-user-default-rtdb.europe-west1.firebasedatabase.app/"

function changeImgSource(id, imgSource) {
    imgId = document.getElementById(id)
    imgId.src = imgSource;
}

async function init() {
    await loadUserData()
}

async function loadUserData() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        console.log("Kein eingeloggter User gefunden!");
        return window.location.href = "index.html?";
    }
    let dataPath = userId === "guest" ? "users/guest.json" : `users/${userId}.json`;
    let response = await fetch(BASE_URL + dataPath);
    let userData = await response.json();
    document.getElementById('userName').innerHTML = userData.userDatas.user || "";
    document.getElementById('smallInitials').innerText = findInitials(userData.userDatas.user) || "G"
    currentTime(userId);
}

function findInitials(contactName) {
    let name = contactName.split(' ');
    let initials = '';
    for (let i = 0; i < name.length; i++) {
        initials += name[i].substring(0, 1).toUpperCase();
    }
    return initials
}

function currentTime(userId) {
    const currentTime = new Date().getHours();
    let greeting = "";
    if (currentTime < 12) {
        greeting = "Good morning";
    } else if (currentTime < 18) {
        greeting = "Good day";
    } else {
        greeting = "Good evening";
    }
    if (userId !== "guest") {
        greeting += ",";
    }
    document.getElementById('currentGreeting').innerHTML = greeting;
}

async function readFromDatabase() {
    try {
        let userKey = localStorage.getItem("userId");
        let allLoadTasks = [];
        let result = await fetch(`${BASE_URL}users/${userKey}/tasks.json`);
        if (!result.ok) {
            throw new Error(`error when loading the data: ${result.statusText}`);
        }
        let data = await result.json();
        if (data) {
            Object.entries(data).forEach(([firebaseKey, value]) => {
                value.id = firebaseKey;
                if (!value.assignedContacts) {
                    value.assignedContacts = [];
                }
                allLoadTasks.push(value);
            });
            loadNumberOfTasksinHtmlElements(allLoadTasks);
            loadNumberOfPriorityTasks(allLoadTasks);
        }
    } catch (error) {
        console.error("error loading the data:", error);
    }
}

function loadNumberOfTasksinHtmlElements(allLoadTasks) {
    document.getElementById("number-of-tasks-in-to-do").innerHTML = allLoadTasks.filter(element => element.category === "toDos").length;
    document.getElementById("number-of-tasks-in-progress").innerHTML = allLoadTasks.filter(element => element.category === "inProgress").length;
    document.getElementById("number-of-tasks-in-awaiting-feedback").innerHTML = allLoadTasks.filter(element => element.category === "awaitFeedback").length;
    document.getElementById("number-of-tasks-in-done").innerHTML = allLoadTasks.filter(element => element.category === "done").length;
    document.getElementById("number-of-all-tasks").innerHTML = allLoadTasks.length;
}

function loadNumberOfPriorityTasks(allLoadTasks) {
    let numberOfUrgentTasks = allLoadTasks.length > 0 ? allLoadTasks.filter(element => element.taskPriority === "urgent").length : 0;
    let numberOfMediumTasks = allLoadTasks.length > 0 ? allLoadTasks.filter(element => element.taskPriority === "medium").length : 0;
    let numberOfLowTasks = allLoadTasks.length > 0 ? allLoadTasks.filter(element => element.taskPriority === "low").length : 0;
    if (numberOfUrgentTasks !== 0) {
        document.getElementById("number-of-priority-tasks").innerHTML = numberOfUrgentTasks;
        document.getElementById("priority-text").innerHTML = "Urgent";
        document.getElementById("priority-img").src = "assets/icons/urgent-summary.png";
        loadUpcomingDeadline(allLoadTasks, "urgent")
        return;
    } else if (numberOfMediumTasks !== 0) {
        document.getElementById("number-of-priority-tasks").innerHTML = numberOfMediumTasks;
        document.getElementById("priority-text").innerHTML = "Medium";
        document.getElementById("priority-img").src = "assets/icons/medium-summary.svg";
        loadUpcomingDeadline(allLoadTasks, "medium")
        return;
    } else if (numberOfLowTasks !== 0) {
        document.getElementById("number-of-priority-tasks").innerHTML = numberOfLowTasks;
        document.getElementById("priority-text").innerHTML = "Low";
        document.getElementById("priority-img").src = "assets/icons/low-summary.svg";
        loadUpcomingDeadline(allLoadTasks, "low")
        return;
    }
}

function loadUpcomingDeadline(allLoadTasks, priority) {
    let tasksWithCurrentPriority = allLoadTasks.filter(element => element.taskPriority === priority);
    let datesOfUpcomingDeadlines = tasksWithCurrentPriority.map(element => element.taskDuoDate);
    const currentDate = new Date();
    let pastDeadlines = [];
    let futureDeadlines = [];
    if (datesOfUpcomingDeadlines ) {
        
        for (let dateString of datesOfUpcomingDeadlines) {
            if (!dateString) continue;
            let taskDate = new Date(dateString.split("/").reverse().join("-"));
            if (taskDate < currentDate) {
                pastDeadlines.push(taskDate);
            } else {
                futureDeadlines.push(taskDate);
            }
        }
        let closestDeadline = null;
        if (pastDeadlines.length > 0) {
            closestDeadline = pastDeadlines.reduce((closest, current) => {
                return (current > closest && current < currentDate) ? current : closest;
            });
            let deadlineText = document.getElementById("deadline-text");
            deadlineText.innerHTML = "Expired Deadline";
            deadlineText.style.color = "#FF8190";
            deadlineText.style.fontWeight = "bold";
        }
        if (!closestDeadline && futureDeadlines.length > 0) {
            closestDeadline = futureDeadlines.reduce((closest, current) => {
                return (current < closest) ? current : closest;
            });
            let deadlineText = document.getElementById("deadline-text");
            deadlineText.innerHTML = "Upcoming Deadline";
        }
        if (closestDeadline) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById("currentDate").innerHTML = closestDeadline.toLocaleDateString('en-US', options);
        }
    }
}

