//import { fgpURL, CATEGORY_ORDER, FILTER_ONLY, days } from "./variables";

async function fetchMatchesFgpRaxoi() {
    return fetchMatchesFgp(fgpURL, FILTER_ONLY);
}

async function fetchMatchesFgp(url, filter) {
    return new Promise((resolve, reject) => {
        $.get(url, function (data) {
            let matches = [];
            const $table = $($.parseHTML(data)).find("#agenda_tabla");
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

function sortMatchesByDate(matches) {
    return matches.sort((a, b) => a.date_obj - b.date_obj);
}

function sortMatchesUsingCategoryOrder(matches) {
    return matches.sort((a, b) => customSort(a.league, b.league, CATEGORY_ORDER));
}

function sortMatchesByDateAndCategory(matches) {
    return sortMatchesUsingCategoryOrder(sortMatchesByDate(matches));
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

function clean_category(text) {
    //TODO
}


