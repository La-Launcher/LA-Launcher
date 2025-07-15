$(".app-main-server-search-input").on("input", filterServers);
$("#app-servers-filter-trash").on("click", clearAllTags);

$(".app-servers-filter-box box").on("click", function() {
    const checkbox = $(this).find("input[type='checkbox']");
    checkbox.prop("checked", !checkbox.prop("checked")).trigger("change");
    filterServers();
});

function filterServers() {
    let emptyShow = $("#app-servers-filter-empty").is(":checked");
    let fullShow = $("#app-servers-filter-full").is(":checked");
    let searchTerm = $(".app-main-server-search-input").val().toLowerCase();

    $(".app-server-list-main").each(function () {
        let countText = $(this).find(".app-server-list-server-player-count").text().split("/").map(s => parseInt(s.trim(), 10));
        let [maxCount, playerCount] = countText;

        const serverName = $(this).find(".app-server-list-server-name").text().toLowerCase();
        const serverIp = $(this).attr("ip") ? $(this).attr("ip").toLowerCase() : '';

        let matchesFilter = (emptyShow && playerCount === 0) || (fullShow && playerCount >= maxCount);
        let matchesSearch = serverName.includes(searchTerm) || serverIp.includes(searchTerm);

        let matchesTags = activeTags.every(t => $(this).attr('tags')?.split(',').includes(t)) && !redTags.some(t => $(this).attr('tags')?.split(',').includes(t));

        if ((matchesFilter || !matchesSearch) || !matchesTags)
            $(this).hide();
        else
            $(this).show();
    });

    toggleTrashButton();
    saveTagsToLocalStorage();
}

$(".app-server-info-more input").on("input", function () {
    let val = $(this).val().toLowerCase();
    $(".app-server-info-data div").each(function () {
      $(this).toggle($(this).text().toLowerCase().includes(val));
    });
});

let activeTags = [], redTags = [];

function filterServersByTag() {
    $('.app-server-list-main').each(function() {
        const server = $(this), serverTags = server.attr('tags')?.split(',') || [];
        server.toggle(activeTags.every(t => serverTags.includes(t)) && !redTags.some(t => serverTags.includes(t)));
    });
    filterServers();
}

function handleTagClick(tagElement) {
    const tag = tagElement.find('h1').text().trim().toLowerCase();
    if (tagElement.hasClass('active')) {
        activeTags = activeTags.filter(t => t !== tag);
        redTags.push(tag);
        tagElement.removeClass('active').addClass('red').css('background', '#7D2A21');
    } else if (tagElement.hasClass('red')) {
        redTags = redTags.filter(t => t !== tag);
        tagElement.removeClass('red').css('background', '');
    } else {
        activeTags.push(tag);
        tagElement.addClass('active').css('background', '#166955');
    }
    filterServersByTag();
    toggleTrashButton();
    saveTagsToLocalStorage();
}

function clearAllTags() {
    activeTags = [];
    redTags = [];
    $('.filter-tag').removeClass('active red').css('background', ''); 
    filterServersByTag();
    toggleTrashButton();
    saveTagsToLocalStorage();
}

function toggleTrashButton() {
    if (activeTags.length > 0 || redTags.length > 0) 
        $("#app-servers-filter-trash, .app-main-server-search-filter-button-menu div").show();
    else
        $("#app-servers-filter-trash, .app-main-server-search-filter-button-menu div").hide();
}

function saveTagsToLocalStorage() {
    const filters = {
        activeTags,
        redTags,
        emptyShow: $("#app-servers-filter-empty").is(":checked"),
        fullShow: $("#app-servers-filter-full").is(":checked")
    };
    localStorage.setItem('serverFilters', JSON.stringify(filters));
}

function loadTagsFromLocalStorage() {
    const filters = JSON.parse(localStorage.getItem('serverFilters'));
    if (filters) {
        activeTags = filters.activeTags || [];
        redTags = filters.redTags || [];
        $("#app-servers-filter-empty").prop("checked", filters.emptyShow);
        $("#app-servers-filter-full").prop("checked", filters.fullShow);

        filterServers();
    }
}

export function renderTags(tags) {
    loadTagsFromLocalStorage();
    const tagsBoxHash = $('.app-servers-filter-tags-box');

    const activeTagsBackup = [...activeTags];
    const redTagsBackup = [...redTags];

    if (activeTags.length > 0 || redTags.length > 0) {
        tagsBoxHash.empty();
        activeTags = [];
        redTags = [];
    }

    tags.forEach(data => {
        const tagElement = $(`<div class="filter-tag"><h1>${data[0]}</h1><h2>${data[1]}</h2></div>`);
        tagsBoxHash.append(tagElement);

        if (activeTagsBackup.includes(data[0].toLowerCase())) tagElement.addClass('active').css('background', '#166955');
        if (redTagsBackup.includes(data[0].toLowerCase())) tagElement.addClass('red').css('background', '#7D2A21');
    });

    activeTags = activeTagsBackup.filter(tag => tags.some(t => t[0].toLowerCase() === tag));
    redTags = redTagsBackup.filter(tag => tags.some(t => t[0].toLowerCase() === tag));    

    $('.filter-tag').click(function() { handleTagClick($(this)); });

    toggleTrashButton();
}

let activeSorts = { letter: null, number: null };

$(".app-servers-sort div").click(function () {
    let img = $(this).find("img"), src = img.attr("src"), index = $(this).index();

    $(".app-servers-sort div").removeClass("selected");
    $(this).addClass("selected");

    if (index === 0) {
        activeSorts = { letter: null, number: null };
        $(".app-servers-sort div img").each(function () {
            $(this).attr("src", $(this).attr("data-default-src"));
        });
        return sortServers("boost");
    }

    let isDescending = src.includes("-down-up");
    img.attr("src", isDescending ? src.replace("down-up", "up-down") : src.replace("up-down", "down-up"));
    activeSorts[index === 1 ? "letter" : "number"] = isDescending ? "desc" : "asc";

    sortServers();
});

export function sortServers(type = "") {
    let servers = $(".app-server-list-main").toArray();
    if (type === "boost") {
        servers.sort((a, b) => {
            let boostA = parseInt($(a).find(".app-server-list-server-boost span").text(), 10) || 0;
            let boostB = parseInt($(b).find(".app-server-list-server-boost span").text(), 10) || 0;
            if (boostA !== boostB) return boostB - boostA;
            return parseInt($(b).find(".app-server-list-server-player-count").text().split("/")[1], 10) - parseInt($(a).find(".app-server-list-server-player-count").text().split("/")[1], 10);
        });
    } else {
        if (activeSorts.letter) {
            let isDesc = activeSorts.letter === "desc";
            servers.sort((a, b) => {
                let [nameA, nameB] = [a, b].map(el => $(el).find(".app-server-list-server-name").text().replace(/^[^a-zA-Z]+/, "").toLowerCase());
                return isDesc ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
            });
        }
        if (activeSorts.number) {
            let isDesc = activeSorts.number === "desc";
            servers.sort((a, b) => isDesc ?
                $(b).find(".app-server-list-server-player-count").text().split("/")[1] -
                $(a).find(".app-server-list-server-player-count").text().split("/")[1] :
                $(a).find(".app-server-list-server-player-count").text().split("/")[1] -
                $(b).find(".app-server-list-server-player-count").text().split("/")[1]
            );
        }
    }
    $(".app-server-list").empty().append(servers);
    $(".app-server-list").scrollTop(0);
}

$(".app-servers-sort div img").each(function () {
    $(this).attr("data-default-src", $(this).attr("src"));
});

let hoverTimeout, menuCheckTimeout, sortMenuCheckTimeout;

function showMenu(menu, button, offsetTop) {
    let position = button.offset();
    let screenWidth = $(window).width();
    console.log(screenWidth)
    let newTopVW = ((position.top + offsetTop) / screenWidth) * 100;
    let newLeftVW = (position.left / screenWidth) * 100;

    console.log(newLeftVW)
    menu.css({ "top": ((position.top + 20) / screenWidth) * 100 + "vw", "left": newLeftVW + "vw", "display": "none", "opacity": 0 });

    setTimeout(() => {
        menu.css("display", "flex");
        setTimeout(() => menu.css({ "opacity": 1, "top": newTopVW + "vw" }), 100);
    }, 200);
}

function hideMenu(menu) {
    let position = menu.offset();
    let screenWidth = $(window).width();
    setTimeout(() => {
        menu.css({ "opacity": 0, "top": ((position.top - 10) / screenWidth) * 100 + "vw" });
        setTimeout(() => menu.css("display", "none"), 200);
    }, 200);
}

$(".app-main-server-search-filter-button-menu, .app-main-server-search-filter-sort").mouseenter(function () {
    clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(() => {
        let menu = $(this).hasClass("app-main-server-search-filter-button-menu") ? $(".app-servers-filter") : $(".app-servers-sort");
        showMenu(menu, $(this), 50);

        let checkTimeout = $(this).hasClass("app-main-server-search-filter-button-menu") ? menuCheckTimeout : sortMenuCheckTimeout;
        clearTimeout(checkTimeout);

        let timeout = $(this).hasClass("app-main-server-search-filter-button-menu") ? 2000 : 2000;
        checkTimeout = setTimeout(() => {
            if (!$(this).is(":hover") && !menu.is(":hover")) hideMenu(menu);
        }, timeout);
    }, 300);
});

$(".app-main-server-search-filter-button-menu, .app-main-server-search-filter-sort").mouseleave(function () {
    clearTimeout(hoverTimeout);
    let menu = $(this).hasClass("app-main-server-search-filter-button-menu") ? $(".app-servers-filter") : $(".app-servers-sort");
    setTimeout(() => { if (!menu.is(":hover")) hideMenu(menu); }, 100);
});

$(".app-servers-filter, .app-servers-sort").mouseenter(function () {
    clearTimeout($(this).hasClass("app-servers-filter") ? menuCheckTimeout : sortMenuCheckTimeout);
});

$(".app-servers-filter, .app-servers-sort").mouseleave(function () {
    let menu = $(this).hasClass("app-servers-filter") ? $(".app-servers-filter") : $(".app-servers-sort");
    setTimeout(() => { if (!$(this).is(":hover")) hideMenu(menu); }, 100);
});