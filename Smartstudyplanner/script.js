let latestPlan = [];

function generatePlan() {
  const input = document.getElementById("subjects").value.trim().split("\n");
  const dailyHours = parseInt(document.getElementById("dailyHours").value);
  const today = new Date();

  let subjects = [];
  input.forEach(line => {
    let [name, hrs, deadline] = line.split(",");
    subjects.push({name: name.trim(), hours: parseInt(hrs), deadline: new Date(deadline.trim())});
  });

  subjects.sort((a,b) => a.deadline - b.deadline);

  let plan = [];
  subjects.forEach(sub => {
    let daysLeft = Math.ceil((sub.deadline - today)/(1000*60*60*24));
    let hoursPerDay = Math.max(1, Math.floor(sub.hours / Math.max(1, daysLeft)));
    for (let d=0; d<daysLeft; d++) {
      let date = new Date(today);
      date.setDate(today.getDate() + d);
      plan.push({date: date.toISOString().split("T")[0], subject: sub.name, hours: Math.min(dailyHours, hoursPerDay)});
    }
  });

  latestPlan = plan;

  // Create table
  let html = "<table><tr><th>Date</th><th>Subject</th><th>Hours</th></tr>";
  plan.slice(0, 15).forEach(row => {
    html += `<tr><td>${row.date}</td><td>${row.subject}</td><td>${row.hours}</td></tr>`;
  });
  html += "</table>";
  document.getElementById("plan").innerHTML = html;

  // Chart
  let summary = {};
  plan.forEach(r => summary[r.subject] = (summary[r.subject] || 0) + r.hours);

  let ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Total Hours',
        data: Object.values(summary),
        backgroundColor: ["#4caf50","#2196f3","#ff9800","#9c27b0","#ff5722"]
      }]
    }
  });
}

function downloadCSV() {
  if (latestPlan.length === 0) {
    alert("Please generate a plan first!");
    return;
  }

  let csv = "Date,Subject,Hours\n";
  latestPlan.forEach(row => {
    csv += `${row.date},${row.subject},${row.hours}\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "study_plan.csv";
  link.click();
}
