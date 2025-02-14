//import { CATEGORY_ORDER, leagueColors } from './variables.js';
//import { customSort } from './fgp.js';

function add_gcal_button(table) {
    // Ensure table is a DOM element
    if (table instanceof jQuery) {
        table = table[0];
    }
    const rows = table.getElementsByTagName('tr');

    const hour_col_idx = 1;
    let category = "";
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length < 3) {
            category = cells[0]?.innerHTML.trim();
            continue;
        }
        
        if (cells[hour_col_idx]?.innerHTML.trim() !== '') {
            const button = document.createElement('button');
            button.innerHTML = '+';
            button.style.borderRadius = '50%';
            button.style.border = 'none';
            button.style.backgroundColor = 'orange';
            button.style.color = 'white';
            button.style.width = '20px';
            button.style.height = '20px';
            button.style.marginLeft = '10px';

            button.addEventListener('click', function(event) {
                const cell = event.target.closest('td');
                const match_date = cells[0]?.innerHTML.trim().split(" ")[1];
                const match_hour = cells[1]?.innerHTML.trim();
                const team1 = cells[3]?.innerHTML.trim();
                const team2 = cells[4]?.innerHTML.trim();
                const location_txt = cells[5]?.innerHTML.trim();
                const table = cell.closest('table');
                
                const previousH2 = table.previousElementSibling;
                while (previousH2 && !(previousH2.tagName === 'H2' && previousH2.classList.contains('hockey-category'))) {
                    previousH2 = previousH2.previousElementSibling;
                }
                const category = previousH2 ? previousH2.textContent : null;

                const title = "🏒 HOCKEY [" + category + "] || " + team1 + " -- " + team2;
                let description = "🏒 " + category + " 🏒 \n\n";
                if (team1.includes("RAXOI")) {
                    description += "🏆🔶" + team1 + "🔶 --vs-- "; 
                } else {
                    description += team1 + "  --vs--  "; 
                }
                if (team2.includes("RAXOI")) {
                    description += "🔶" + team2 + "🔶🏆\n";
                } else {
                    description += team2 + "\n";
                }  
                add_to_gcal(title, match_date, match_hour, location_txt, description);
            });

            cells[2]?.appendChild(button);
        }
    }
}

function add_to_gcal(event_title, date, init_hour, location_txt, description) {
    // Define variables for each parameter
    const encoded_title = encodeURIComponent(event_title);
    const encoded_detail = encodeURIComponent(description);
    const encoded_location = encodeURIComponent(location_txt);
    // Convert the date and time strings to the correct format
    const [day, month, year] = date.split('/');
    const [hour, minute] = init_hour.split(':');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const isoTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;

    // Parse the ISO date and time strings into a Date object
    const start = new Date(`${isoDate}T${isoTime}`);
    if (isNaN(start.getTime())) {
        console.error('Invalid date or time:', date, init_hour);
        return;
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const start_iso = start.toISOString().replace(/[-:]/g,"").substring(0,15) + "Z";
    const end_iso = end.toISOString().replace(/[-:]/g,"").substring(0,15) + "Z";

    // Construct the Google Calendar event creation page URL with pre-filled fields
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encoded_title}&dates=${start_iso}/${end_iso}&sf=false&location=${encoded_location}&details=${encoded_detail}&output=xml`;
    console.log(url)

    // Open the URL in a new browser tab
    window.open(url, '_blank');
}

function getLeagueColor(league) {
  for (const key in leagueColors) {
    if (league.startsWith(key)) {
      return leagueColors[key];
    }
  }
  return '#000000'; // Default color if no match found
}

/**
 * Custom sort function for FullCalendar events based on CATEGORY_ORDER.
 */
function eventOrder(eventA, eventB) {
  return customSort(eventA.title, eventB.title, CATEGORY_ORDER);
}

async function renderCalendar(matches, next_days=50) {
  const today = new Date();
  const next_week = new Date(today);
  next_week.setDate(today.getDate() + next_days);
  const next_matches = matches.filter(match => match.date_obj >= today && match.date_obj <= next_week);

  const events = next_matches.map(match => ({
    title: match.league,
    description: `${match.team1} vs ${match.team2}`,
    // print Orange the team name if that team contains "RAXOI"
    htmlDescription: `${match.team1.includes(FILTER_ONLY) ? `<span style="color: orange;">${match.team1}</span>` : match.team1} vs ${match.team2.includes(FILTER_ONLY) ? `<span style="color: orange;">${match.team2}</span>` : match.team2}`,
    location: match.location,
    team1: match.team1,
    team2: match.team2,
    start: match.date_obj,
    color: getLeagueColor(match.league)
  }));

  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    firstDay: 1,
    events: events,
    eventOrder: eventOrder, // Add this line to set the event order
    eventTimeFormat: { // use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventMouseEnter: function(info) {
      const tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = `<strong>${info.event.title}</strong><br>${info.event.start.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}<br>${info.event.extendedProps.description}`;
      tooltip.style.display = 'block';
    },
    eventMouseLeave: function() {
      const tooltip = document.getElementById('tooltip');
      tooltip.style.display = 'none';
    },
    eventClick: function(info) {
      const modalHtml = `
        <div class="modal fade" id="eventDetailsModal" tabindex="-1" role="dialog" aria-labelledby="eventDetailsModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="eventDetailsModalLabel">${info.event.title}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p><strong>Día:</strong> ${info.event.start.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Hora:</strong> ${info.event.start.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                <p><strong>Description:</strong> ${info.event.extendedProps.htmlDescription}</p>
                <p><strong>Location:</strong> ${info.event.extendedProps.location}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      $('body').append(modalHtml);
      $('#eventDetailsModal').modal('show');
      $('#eventDetailsModal').on('hidden.bs.modal', function () {
        $(this).remove();
      });
    }
  });
  calendar.render();
}