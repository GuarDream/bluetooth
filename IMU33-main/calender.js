const calendarBody = document.getElementById("calendarBody");
const monthYearElement = document.getElementById("monthYear");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Sample data - Steps achieved on each day
const stepsData = {
    "2024-03-01": 500,
    "2024-03-05": 1000,
    "2024-03-10": 800,
    "2024-03-15": 1200,
    "2024-03-20": 600,
    // Add more dates and steps as needed
};

prevBtn.addEventListener("click", () => {
    currentMonth--;
    updateCalendar();
});

nextBtn.addEventListener("click", () => {
    currentMonth++;
    updateCalendar();
});

function updateCalendar() {
    calendarBody.innerHTML = "";
    monthYearElement.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        calendarBody.appendChild(dayElement);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = day;
        calendarBody.appendChild(dayElement);

        // Check if this day has a dot (sample check, replace with actual logic)
        // Check if this day has a dot based on step count
        const currentDate = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(day)}`;
        if (stepsData[currentDate] && stepsData[currentDate] >= 1000) {
            dayElement.classList.add("has-dot");
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dayElement.appendChild(dot);
        }
    }
}

function getMonthName(month) {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return months[month];
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}




// Initial calendar render
updateCalendar();



