// Get the current date
let today = new Date();
let yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
let tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
let dayBeforeYesterday = new Date(today);
dayBeforeYesterday.setDate(today.getDate() - 2);
let dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);

// Update the HTML with the dates
document.getElementById('day-before-yesterday').getElementsByClassName('date')[0].innerHTML = formatDate(dayBeforeYesterday);
document.getElementById('yesterday').getElementsByClassName('date')[0].innerHTML = formatDate(yesterday);
document.getElementById('today').getElementsByClassName('date')[0].innerHTML = formatDate(today);
document.getElementById('tomorrow').getElementsByClassName('date')[0].innerHTML = formatDate(tomorrow);
document.getElementById('day-after-tomorrow').getElementsByClassName('date')[0].innerHTML = formatDate(dayAfterTomorrow);

// Check if steps goal is reached
let stepsGoal = 1000;
let stepsReached = false; // Set this to true if steps goal is reached

if (stepsReached) {
    document.getElementById('today').classList.add('dark');
}

// Function to format the date nicely
function formatDate(date) {
    let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    let dayOfWeek = daysOfWeek[date.getDay()];
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!

    return `<div>${dayOfWeek}</div><div>${mm}/${dd}</div>`;
}
