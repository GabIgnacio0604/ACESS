// Original inline script for BOTH User and StudentCouncil Student Council pages
// Place this code inside <script> tags at the bottom of the HTML files

document.addEventListener("DOMContentLoaded", async () => {
  const nameElement = document.querySelector(".account-name");
  const executiveContainer = document.getElementById("executive-positions");
  const gradeContainer = document.getElementById("grade-representatives");
  const voteLeadersContainer = document.getElementById("vote-leaders");

  // Fetch user name
  try {
    const res = await fetch("/Admin/Php/get_logged_user.php");
    const data = await res.json();

    if (data.fullname) {
      nameElement.textContent = data.fullname;
    } else {
      nameElement.textContent = "Not Logged In";
      console.error("Error fetching name:", data.error);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    nameElement.textContent = "Error";
  }

  // Check voting status and load appropriate content
  async function checkVotingStatus() {
    try {
      const response = await fetch('../API/voting_settings.php');
      const data = await response.json();

      if (data.success) {
        if (data.data.voting_active) {
          // Show voting in progress message
          executiveContainer.innerHTML = '<p style="text-align:center;color:#ffd54f;font-size:1.2rem;">Voting is currently in progress...</p>';
          gradeContainer.innerHTML = '<p style="text-align:center;color:#ffd54f;font-size:1.2rem;">Results will be displayed after voting ends.</p>';
          voteLeadersContainer.innerHTML = '<p style="text-align:center;color:#ffd54f;font-size:1.2rem;">Stay tuned for results!</p>';
        } else {
          // Load elected candidates if voting is not active
          await loadElectedCandidates();
        }
      } else {
        console.error('Error checking voting status:', data.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const attachCandidatesChart = (positions, elId) => {

    // Create a canvas element
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = `chart-${positions.position.replace(/\s+/g, '-').toLowerCase()}`;

    // Create container div for the position
    const containerDiv = document.createElement('div');
    containerDiv.style.marginBottom = '20px';
    containerDiv.style.padding = '15px';
    containerDiv.style.backgroundColor = '#2a2a2a';
    containerDiv.style.borderRadius = '8px';

    // Add position title
    const titleElement = document.createElement('h3');
    titleElement.textContent = positions.position;
    titleElement.style.marginBottom = '15px';
    titleElement.style.color = '#ffd54f';

    containerDiv.appendChild(titleElement);
    containerDiv.appendChild(chartCanvas);

    // Append to the executive container
    document.getElementById(elId).appendChild(containerDiv);

    // Prepare data for the chart
    const data = {
      labels: positions.candidates.map(c => c.name),
      datasets: [{
        label: 'Votes',
        data: positions.candidates.map(c => parseInt(c.votes)),
        backgroundColor: '#ffd54f',
        borderColor: '#ffd54f',
        borderWidth: 1
      }]
    };

    // Chart configuration
    const config = {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: '#444'
            },
            ticks: {
              color: '#fff',
              stepSize: 1,
              callback: function(value) {
                return Math.floor(value);
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: '#fff'
            }
          }
        }
      }
    };

    // Create the chart
    new Chart(chartCanvas, config);
  }

  // Load elected candidates
  async function loadElectedCandidates() {
    try {
      const response = await fetch('/Admin/Php/get_elected_candidates.php');
      const data = await response.json();

      const currentElected = !data.voting_active ? data.elected : data.previous_year.elected;

      if (data.success) {
        // Display previous year's elected candidates
        if (currentElected) {
          const currentYearContainer = document.getElementById('current-year-council');
          currentYearContainer.innerHTML = '<h3 class="section-title">Current Year\'s Council</h3>';
          
          const prevYearGrid = document.createElement('div');
          prevYearGrid.className = 'prev-year-grid';
          
          // Style for the grid container
          prevYearGrid.style.display = 'grid';
          prevYearGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
          prevYearGrid.style.gap = '20px';
          prevYearGrid.style.padding = '20px';
          prevYearGrid.style.backgroundColor = '#2a2a2a';
          prevYearGrid.style.borderRadius = '8px';
          prevYearGrid.style.marginBottom = '30px';
          
          Object.entries(currentElected).forEach(([position, candidate]) => {
            const positionCard = document.createElement('div');
            positionCard.className = 'position-card';
            positionCard.style.padding = '15px';
            positionCard.style.backgroundColor = '#333';
            positionCard.style.borderRadius = '8px';
            positionCard.style.textAlign = 'center';
            
            positionCard.innerHTML = `
              <h4 style="color: #ffd54f; margin-bottom: 10px;">${position}</h4>
              <p style="color: #fff; font-size: 1.1em; margin: 5px 0;">${candidate.name}</p>
            `;
            
            prevYearGrid.appendChild(positionCard);
          });
          
          currentYearContainer.appendChild(prevYearGrid);
        }

        if(data.voting_active) {
          for (let i = 0; i < data.positions.length; i++) {
            const pos = data.positions[i];
            const sanitized = pos.position.replace(/\s+/g, '-').toLowerCase();
            const posEl = document.createElement('div');
            posEl.id = `position-${sanitized}`;
            posEl.className = 'position-container';
            document.getElementById('vote-leaders').appendChild(posEl);

            // attach chart to the newly created element
            attachCandidatesChart(pos, posEl.id);
          }
        }else{
          // Remove council-right element if it exists
          const councilRight = document.querySelector('.council-right');
          if (councilRight) {
            councilRight.remove();
          }
        }

      } else {
        console.error('Error loading candidates:', data.message);
        executiveContainer.innerHTML = '<p style="color:#f44;">Error loading data</p>';
        gradeContainer.innerHTML = '<p style="color:#f44;">Error loading data</p>';
        voteLeadersContainer.innerHTML = '<p style="color:#f44;">Error loading data</p>';
      }
    } catch (err) {
      console.error('Error:', err);
      executiveContainer.innerHTML = '<p style="color:#f44;">Failed to load data</p>';
      gradeContainer.innerHTML = '<p style="color:#f44;">Failed to load data</p>';
      voteLeadersContainer.innerHTML = '<p style="color:#f44;">Failed to load data</p>';
    }
  }

  // Check voting status and load appropriate data
  // checkVotingStatus();
  loadElectedCandidates();
});