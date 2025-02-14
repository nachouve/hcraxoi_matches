//import { fgpURL, CATEGORY_ORDER, FILTER_ONLY, days } from "./variables";

async function fetchMatchesFgpRaxoi() {
    return fetchMatchesFgp(fgpURL, FILTER_ONLY);
}

async function fetchMatchesFgp(url, filter) {
    return new Promise((resolve, reject) => {
        $.get(url, function (data) {
            let matches = [];
            const $table = $($.parseHTML(data)).find("#agenda_tabla");
            //filterTable($table, filter);
            //const groups = groupRowsByCategory($table);
             //const sortedGroups = sortGroups(groups);
            matches = parseMatchesFgp($table);
            matches = filterMatches(matches, filter);
            resolve(matches);
        }).fail(reject);
    });
}

function parseMatchesFgp(table) {
    const $table = $(table); // Ensure table is a jQuery object
    const matches = [];
    let currentCategory = "";
    let sequenceNumber = 0; // Initialize sequence number
    $table.find("tr").each(function () {
        const cells = $(this).find("td");
        let date_str = cells.eq(2).text().trim();
        if (date_str.includes(" ")) {
            // sometimes come with "day_week_name" first
            date_str = date_str.split(" ")[1];
        }
        const [day, month, year] = date_str.split('/');
        const [hour, minute] = cells.eq(3).text().trim().split(':');
        let date_obj;
        if (hour > -1 && minute > -1) {
            date_obj = new Date(year, month - 1, day, hour, minute);
        } else {
            date_obj = new Date(year, month - 1, day, 23, 0);
        }
        if (cells.length > 0) {
            const category = cells.eq(1).text().trim();
            if (category !== currentCategory) {
                //console.log(category);
                currentCategory = category;
                leagueId = CryptoJS.MD5(category).toString(); // Create a md5 hash of the category name
                sequenceNumber = 0; // Reset sequence number for new category
            }
            sequenceNumber++; // Increment sequence number
            matches.push({
                league: currentCategory,
                league_match_id: `${leagueId}_${sequenceNumber}`, 
                date_obj: date_obj,
                date: date_str,
                time: cells.eq(3).text().trim(),
                formatted_date: WEEK_DAYS[date_obj.getDay()].substring(0, 3) + " " + date_str,
                team1: cells.eq(5).text().trim(),
                team2: cells.eq(7).text().trim(),
                score: "",
                soon: is_soon(date_obj),
                location: cells.eq(9).text().trim()
            });
        }
    });
    return matches;
}

function filterMatches(matches, filter) {
    if (!filter) {
        return matches;
    }
    return matches.filter(match => match.team1.includes(filter) || match.team2.includes(filter));
}

function filterTable($table, filter) {
    $table.find('tr:not(:contains(' + filter + '))').remove();
}

function sortMatchesUsingCategoryOrder(matches) {
    return matches.sort((a, b) => customSort(a.league, b.league, CATEGORY_ORDER));
}

function groupRowsByCategory($table) {
    const groups = {};
    $table.find("tr").each(function () {
        const category = $(this).find("td:eq(1)").text().trim();
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push($(this));
        processRowDateFgp($(this));
    });
    return groups;
}

function processRowDateFgp($row) {
    const dateText = $row.find("td:eq(2)").text().trim();
    const dateArr = dateText.split("/");
    const matchDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
    const dayName = WEEK_DAYS[matchDate.getDay()];
    $row.find("td:eq(2)").text(dayName.substring(0, 3) + " " + dateText);
    if (matchDate.getTime() - Date.now() < 7 * 60 * 60 * 24 * 1000) {
        $row.addClass("match-soon");
    }
}

function sortGroups(groups) {
    const sortedGroups = {};
    Object.keys(groups).sort((a, b) => customSort(a, b, CATEGORY_ORDER)).forEach(function (key) {
        sortedGroups[key] = groups[key];
    });
    return sortedGroups;
}

function renderMatches(matches) {
    const container = document.getElementById('result');
    // Clear the container before rendering
    container.innerHTML = '';
    const groupedMatches = groupMatchesByLeague(matches);
    // sort with the custom order
    const sortedGroups = {};
    Object.keys(groupedMatches).sort((a, b) => customSort(a, b, CATEGORY_ORDER)).forEach(function (key) {
        sortedGroups[key] = groupedMatches[key];
    });

    for (const league in sortedGroups) {
        const leagueTitle = document.createElement('h2');
        leagueTitle.innerText = league;
        leagueTitle.classList.add('text-left'); // Left-align the league title
        leagueTitle.classList.add('hockey-category'); // Used in the add_to_gcal function
        container.appendChild(leagueTitle);

        const table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-bordered', 'table-sm', 'matches-table'); // Add 'table-sm' for compact tables
        table.style.marginBottom = '2px'; // Reduce margin between tables
        const header = document.createElement('thead');
        header.innerHTML = '<tr><th>Data</th><th>Hora</th><th></th><th>Local</th><th>Visitante</th><th>Lugar</th></tr>'; // Removed "ID" column
        table.appendChild(header);

        const tbody = document.createElement('tbody');
        groupedMatches[league].forEach(match => {
            const row = document.createElement('tr');
            if (match.soon) {
                row.classList.add('table-warning');
                row.classList.add('match-soon');
            }
            row.innerHTML = `<td>${match.formatted_date}</td><td>${match.time}</td><td></td><td>${match.team1}</td><td>${match.team2}</td><td>${match.location}</td>`; // Removed "ID" column
            // Show a modal with details when clicking on a row -- I think it is not necessary
            //row.addEventListener('click', () => showMatchDetails(match));
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    }
    // get only tables inside result
    const tables = document.querySelectorAll('table.matches-table');
    tables.forEach(table => add_gcal_button(table));
}

function groupMatchesByLeague(matches) {
    const groupedMatches = {};
    matches.forEach(match => {
        const league = match.league;
        if (!groupedMatches[league]) {
            groupedMatches[league] = [];
        }
        groupedMatches[league].push(match);
    });
    return groupedMatches;
}


function clean_category(text) {
    //TODO
}

function replace_name_in_cells() {
    const targetString = 'HOCKEY CLUB RAXOI';
    const newString = 'HC RAXOI';

    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        const originalContent = cell.textContent;
        if (originalContent.includes(targetString)) {
            cell.textContent = cell.textContent.replace(targetString, newString);
        }

        if (originalContent.includes("RAXOI")) {
            cell.classList.add('important');
        }
    });
}

/**
 * Custom sort function that sorts strings based on a predefined category order.
 * If both strings start with the same category, they are compared lexicographically.
 * If one string starts with a category and the other does not, the one that starts with the category comes first.
 * If neither string starts with any category, they are compared lexicographically.
 *
 * @param {string} a - The first string to compare.
 * @param {string} b - The second string to compare.
 * @param {string[]} categoryOrder - An array of category names in the desired order.
 * @returns {number} - Returns -1 if `a` should come before `b`, 1 if `a` should come after `b`, or 0 if they are considered equal.
 */
function customSort(a, b, categoryOrder = CATEGORY_ORDER) {
    for (var i = 0; i < categoryOrder.length; i++) {
        var startA = a.startsWith(categoryOrder[i]);
        var startB = b.startsWith(categoryOrder[i]);
        if (startA && startB) {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        } else if (startA) {
            return -1;
        } else if (startB) {
            return 1;
        }
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function showMatchDetails(match) {
    const modalHtml = `
        <div class="modal fade" id="matchDetailsModal" tabindex="-1" role="dialog" aria-labelledby="matchDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="matchDetailsModalLabel">${match.league}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Date:</strong> ${match.formatted_date}</p>
                        <p><strong>Time:</strong> ${match.time}</p>
                        <p><strong>Teams:</strong> ${match.team1} vs ${match.team2}</p>
                        <p><strong>Location:</strong> ${match.location}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
    $('#matchDetailsModal').modal('show');
    $('#matchDetailsModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}


