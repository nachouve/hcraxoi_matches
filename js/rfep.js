///// File: rfep.js
//import { days, ligas } from './variables.js';

async function fetchMatchesRfep(liga, filter_team_contains="RAXOI", only_next=true) {
    const url = ligas[liga]; 
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'text/html, */*; q=0.01',
            'Accept-Language': 'es-ES,es;q=0.9,gl-ES;q=0.8,gl;q=0.7,en-GB;q=0.6,en;q=0.5',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://www.hockeypatines.fep.es',
            'Referer': 'https://www.hockeypatines.fep.es/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },
        body: new URLSearchParams({
            'idc': '2817',
            'site_lang': 'es'
        })
    });

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    let matches = parseMatchesRfep(doc, league=liga, filter_team_contains=filter_team_contains);
    if (only_next) {
        const now = new Date();
        matches = matches.filter(match => {
            return match.date_obj >= now;
        });
    }
    return matches;
}

function parseMatchesRfep(doc, league="", filter_team_contains="RAXOI") {
    const matches = [];
    const rows = doc.querySelectorAll('#my_calendar_table tbody tr');            
    let sequenceNumber = 0; // Initialize sequence number
    let leagueId = CryptoJS.MD5(league).toString(); // Create a md5 hash of the category name

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const [day, month, year] = cells[1].innerText.trim().split('/');
        // try if the hour is not available
        let hour = 23;
        let minute = 59;
        if (cells[2].innerText.trim().length > 0) {
            [hour, minute] = cells[2].innerText.trim().split(':');
        } 
        const date_obj = new Date(year, month - 1, day, hour, minute);
        sequenceNumber++; // Increment sequence number
        if (cells.length > 0) {
            const data = {
                league: league,
                date_obj: date_obj,
                league_match_id: `${leagueId}_${sequenceNumber}`, 
                date: cells[1].innerText.trim(),
                time: cells[2].innerText.trim(),
                formatted_date: "",
                team1: cells[6].innerText.trim(),
                team2: cells[8].innerText.trim(),
                score: cells[11].innerText.trim(),
                soon: is_soon(date_obj), 
                location: ""
            };
            if (filter_team_contains && !data.team1.includes(filter_team_contains) && !data.team2.includes(filter_team_contains)) {
                return;
            }
            processRowDateRfep(data);
            matches.push(data);
        }
    });
    return matches;
}

//          //
//         function parseMatchesRfep(table) {
//             const $table = $(table); // Ensure table is a jQuery object
//             const matches = [];
//             let currentCategory = "";
//             $table.find("tr").each(function () {
//                 const cells = $(this).find("td");
//                 const [day, month, year] = cells.eq(2).text().trim().split('/');
//                 const [hour, minute] = cells.eq(3).text().trim().split(':');
//                 const date_obj = new Date(year, month - 1, day, hour, minute);
//                 if (cells.length > 0) {
//                     const category = cells.eq(1).text().trim();
//                     if (category !== currentCategory) {
//                         currentCategory = category;                
//                         sequenceNumber = 0; // Reset sequence number for new category
//                     }
//                     sequenceNumber++; // Increment sequence number
//                     matches.push({
//                         league: currentCategory,
//                         date_obj: date_obj,
//                         date: cells.eq(2).text().trim(),
//                         formatted_date: "",
//                         team1: cells.eq(5).text().trim(),
//                         team2: cells.eq(7).text().trim(),
//                         score: "",
//                         soon: is_soon(date_obj),
//                         location: cells.eq(9).text().trim()
//                     });
//                 }
//             });
//             return matches;
// }

function is_soon(date, in_next_days=7) {
    const now = new Date();
    return date.getTime() - now.getTime() < in_next_days * 24 * 60 * 60 * 1000;
}

function processRowDateRfep(match) {
    const dateText = match.date;
    const dateArr = dateText.split("/");
    const matchDate = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
    const dayName = WEEK_DAYS[matchDate.getDay()];
    match.formatted_date = dayName.substring(0, 3) + " " + dateText;
    if (is_soon(matchDate)) {
        match.soon = true;
    }
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

function displayMatches(matches, filter_team_contains="RAXOI") {
    const container = document.getElementById('result');
    const groupedMatches = groupMatchesByLeague(matches);

    for (const league in groupedMatches) {
        const leagueTitle = document.createElement('h2');
        leagueTitle.innerText = league;
        leagueTitle.classList.add('hockey-category'); // Used in the add_to_gcal function
        container.appendChild(leagueTitle);

        const table = document.createElement('table');
        table.border = '1';
        const header = document.createElement('thead');
        header.innerHTML = '<tr><th>Date/Time</th><th>Team 1</th><th>Team 2</th><th>Score</th></tr>';
        table.appendChild(header);

        const tbody = document.createElement('tbody');
        groupedMatches[league].forEach(match => {
            if (filter_team_contains && !match.team1.includes(filter_team_contains) && !match.team2.includes(filter_team_contains)) {
                return;
            }
            const row = document.createElement('tr');
            if (match.soon) {
                row.classList.add('match-soon');
            }
            row.innerHTML = `<td>${match.date} ${match.time}</td><td>${match.team1}</td><td>${match.team2}</td><td>${match.score}</td>`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    }
}

function fetchMatchesOkLigaOuroFem() {
    return fetchMatchesRfep('OK LIGA OURO FEMENINA');
};

function fetchMatchesOkLigaBronce() {
    return fetchMatchesRfep('OK LIGA BRONCE NORTE');
};

function fetchMatchesOkLigaPlataFem23() {
    return fetchMatchesRfep('OK LIGA PLATA FEMENINA 2023');
}

function fetchMatchesOkLigaBronce23() {
    return fetchMatchesRfep('OK LIGA BRONCE NORTE 2023');
}
