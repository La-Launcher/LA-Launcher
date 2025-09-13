let activeTags = [], redTags = [], activeCountries = [], redCountries = [];
const countryLocaleMap = {
    "fa-ir": "Iranian (Farsi)",
    "fa-af": "Afghan (Dari)",
    "en-us": "American (English)",
    "en-gb": "British (English)",
    "en-au": "Australian (English)",
    "en-ca": "Canadian (English)",
    "en-nz": "New Zealander (English)",
    "en-in": "Indian (English)",
    "en-pk": "Pakistani (English)",
    "en-ph": "Filipino (English)",
    "en-sg": "Singaporean (English)",
    "en-za": "South African (English)",
    "ar-sa": "Saudi (Arabic)",
    "ar-eg": "Egyptian (Arabic)",
    "ar-ae": "Emirati (Arabic)",
    "ar-kw": "Kuwaiti (Arabic)",
    "ar-om": "Omani (Arabic)",
    "ar-qa": "Qatari (Arabic)",
    "ar-bh": "Bahraini (Arabic)",
    "ar-dz": "Algerian (Arabic)",
    "ar-ma": "Moroccan (Arabic)",
    "ar-tn": "Tunisian (Arabic)",
    "ar-ly": "Libyan (Arabic)",
    "ar-iq": "Iraqi (Arabic)",
    "ar-ps": "Palestinian (Arabic)",
    "ar-sy": "Syrian (Arabic)",
    "ar-jo": "Jordanian (Arabic)",
    "ar-lb": "Lebanese (Arabic)",
    "zh-cn": "Chinese (Chinese)",
    "zh-tw": "Taiwanese (Chinese)",
    "zh-hk": "Hong Konger (Chinese)",
    "ja-jp": "Japanese (Japanese)",
    "ko-kr": "Korean (Korean)",
    "de-de": "German (German)",
    "de-at": "Austrian (German)",
    "de-ch": "Swiss (German)",
    "fr-fr": "French (French)",
    "fr-ca": "Canadian (French)",
    "fr-be": "Belgian (French)",
    "fr-ch": "Swiss (French)",
    "es-es": "Spanish (Spanish)",
    "es-mx": "Mexican (Spanish)",
    "es-ar": "Argentine (Spanish)",
    "es-co": "Colombian (Spanish)",
    "es-cl": "Chilean (Spanish)",
    "es-pe": "Peruvian (Spanish)",
    "es-ve": "Venezuelan (Spanish)",
    "es-ec": "Ecuadorian (Spanish)",
    "es-bo": "Bolivian (Spanish)",
    "es-hn": "Honduran (Spanish)",
    "es-gt": "Guatemalan (Spanish)",
    "es-sv": "Salvadoran (Spanish)",
    "es-py": "Paraguayan (Spanish)",
    "es-uy": "Uruguayan (Spanish)",
    "es-ni": "Nicaraguan (Spanish)",
    "es-cr": "Costa Rican (Spanish)",
    "pt-pt": "Portuguese (Portuguese)",
    "pt-br": "Brazilian (Portuguese)",
    "ru-ru": "Russian (Russian)",
    "uk-ua": "Ukrainian (Ukrainian)",
    "pl-pl": "Polish (Polish)",
    "ro-ro": "Romanian (Romanian)",
    "hu-hu": "Hungarian (Hungarian)",
    "fi-fi": "Finnish (Finnish)",
    "sv-se": "Swedish (Swedish)",
    "no-no": "Norwegian (Norwegian)",
    "da-dk": "Danish (Danish)",
    "nl-nl": "Dutch (Dutch)",
    "nl-be": "Flemish (Flemish)",
    "el-gr": "Greek (Greek)",
    "tr-tr": "Turkish (Turkish)",
    "he-il": "Israeli (Hebrew)",
    "hi-in": "Indian (Hindi)",
    "bn-in": "Indian (Bengali)",
    "ta-in": "Indian (Tamil)",
    "te-in": "Indian (Telugu)",
    "ml-in": "Indian (Malayalam)",
    "mr-in": "Indian (Marathi)",
    "gu-in": "Indian (Gujarati)",
    "kn-in": "Indian (Kannada)",
    "pa-in": "Indian (Punjabi)",
    "pa-pk": "Pakistani (Punjabi)",
    "or-in": "Indian (Odia)",
    "as-in": "Indian (Assamese)",
    "ne-np": "Nepalese (Nepali)",
    "si-lk": "Sri Lankan (Sinhala)",
    "km-kh": "Cambodian (Khmer)",
    "lo-la": "Laotian (Lao)",
    "my-mm": "Burmese (Burmese)",
    "th-th": "Thai (Thai)",
    "vi-vn": "Vietnamese (Vietnamese)",
    "id-id": "Indonesian (Indonesian)",
    "ms-my": "Malaysian (Malay)",
    "ms-sg": "Singaporean (Malay)",
    "ur-in": "Indian (Urdu)",
    "ur-pk": "Pakistani (Urdu)"
};

$(".app-main-server-search-input").on("input", filterServers);
$("#app-servers-filter-tag-trash").on("click", clearAllTags);
$("#app-servers-filter-country-trash").on("click", clearAllCountries);

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
        const serverCountry = $(this).attr('country') ? $(this).attr('country').toLowerCase() : '';
        const serverTags = $(this).attr('tags')?.split(',').map(t => t.trim().toLowerCase()) || [];

        let matchesFilter = (emptyShow && playerCount === 0) || (fullShow && playerCount >= maxCount);
        let matchesSearch = serverName.includes(searchTerm) || serverIp.includes(searchTerm);
        let matchesTags = (activeTags.length === 0 || activeTags.every(t => serverTags.includes(t))) && 
                         (redTags.length === 0 || !redTags.some(t => serverTags.includes(t)));
        let matchesCountries = (activeCountries.length === 0 || activeCountries.every(c => serverCountry === c)) && 
                             (redCountries.length === 0 || !redCountries.some(c => serverCountry === c));

        if ((matchesFilter || !matchesSearch) || !matchesTags || !matchesCountries)
            $(this).hide();
        else
            $(this).show();
    });

    toggleTrashButton(true);
    toggleTrashButton(false);
    saveFiltersToLocalStorage();

    $("#players span").text($(".app-server-list-server-player-count:visible").toArray().reduce((sum, el) => sum + (+el.textContent.split("/")[1] || 0), 0) + " players");
    $("#servers span").text($(".app-server-list-server-player-count:visible").length + " servers");
}

$(".app-server-info-more input").on("input", function () {
    let val = $(this).val().toLowerCase();
    $(".app-server-info-data div").each(function () {
      $(this).toggle($(this).text().toLowerCase().includes(val));
    });
});

function filterServersByFilters() {
    $('.app-server-list-main').each(function() {
        const server = $(this);
        const serverTags = server.attr('tags')?.split(',').map(t => t.trim().toLowerCase()) || [];
        const serverCountry = server.attr('country')?.toLowerCase() || '';
        const matchesTags = (activeTags.length === 0 || activeTags.every(t => serverTags.includes(t))) && 
                           (redTags.length === 0 || !redTags.some(t => serverTags.includes(t)));
        const matchesCountries = (activeCountries.length === 0 || activeCountries.every(c => serverCountry === c)) && 
                               (redCountries.length === 0 || !redCountries.some(c => serverCountry === c));
        server.toggle(matchesTags && matchesCountries);
    });
    filterServers();
}

function handleTagClick(tagElement) {
    const tag = tagElement.find('span').text().trim().toLowerCase();
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
    filterServersByFilters();
    toggleTrashButton(false); 
    saveFiltersToLocalStorage();
}

function handleCountryClick(countryElement) {
    const country = countryElement.attr("data-locale");
    if (countryElement.hasClass('active')) {
        activeCountries = activeCountries.filter(c => c !== country);
        redCountries.push(country);
        countryElement.removeClass('active').addClass('red').css('background', '#7D2A21');
    } else if (countryElement.hasClass('red')) {
        redCountries = redCountries.filter(c => c !== country);
        countryElement.removeClass('red').css('background', '');
    } else {
        activeCountries.push(country);
        countryElement.addClass('active').css('background', '#166955');
    }
    filterServersByFilters();
    toggleTrashButton(true); 
    saveFiltersToLocalStorage();
}

function clearAllTags() {
    activeTags = [];
    redTags = [];
    $('.filter-tag').removeClass('active red').css('background', ''); 
    filterServersByFilters();
    toggleTrashButton(false); 
    saveFiltersToLocalStorage();
}

function clearAllCountries() {
    activeCountries = [];
    redCountries = [];
    $('.filter-country').removeClass('active red').css('background', ''); 
    filterServersByFilters();
    toggleTrashButton(true); 
    saveFiltersToLocalStorage();
}

function toggleTrashButton(isCountry) {
    const tagActive = activeTags.length > 0 || redTags.length > 0;
    const countryActive = activeCountries.length > 0 || redCountries.length > 0;
    const menuDiv = $('.app-main-server-search-filter-button-menu div');

    if (isCountry) {
        $('#app-servers-filter-country-trash').toggle(countryActive);
        menuDiv.toggle(tagActive || countryActive); 
    } else {
        $('#app-servers-filter-tag-trash').toggle(tagActive);
        menuDiv.toggle(tagActive || countryActive); 
    }
}

function saveFiltersToLocalStorage() {
    localStorage.setItem(`server_filters`, JSON.stringify({
        activeTags,
        redTags,
        activeCountries,
        redCountries,
        emptyShow: $("#app-servers-filter-empty").is(":checked"),
        fullShow: $("#app-servers-filter-full").is(":checked")
    }));
}

function loadFiltersFromLocalStorage() {
    const filters = JSON.parse(localStorage.getItem(`server_filters`));

    if (filters) {
        activeTags = filters.activeTags || [];
        redTags = filters.redTags || [];
        activeCountries = filters.activeCountries.length == 0 ? ['fa-ir'] : filters.activeCountries;
        redCountries = filters.redCountries || [];
        $("#app-servers-filter-empty").prop("checked", filters.emptyShow);
        $("#app-servers-filter-full").prop("checked", filters.fullShow);
        filterServers();
    }
}

export function renderFilters(servers, tags) {
    loadFiltersFromLocalStorage();
    const tagsBoxHash = $('.app-servers-filter-tags-box').empty();
    const countriesBoxHash = $('.app-servers-filter-country-box').empty();

    const activeTagsBackup = [...activeTags];
    const redTagsBackup = [...redTags];
    const activeCountriesBackup = [...activeCountries];
    const redCountriesBackup = [...redCountries];

    if (activeTags.length > 0 || redTags.length > 0 || activeCountries.length > 0 || redCountries.length > 0) {
        tagsBoxHash.empty();
        countriesBoxHash.empty();
        activeTags = [];
        redTags = [];
        activeCountries = [];
        redCountries = [];
    }

    tags.forEach(data => {
        const tagElement = $(`<div class="filter-tag"><span>${data[0]}</span><h2>${data[1]}</h2></div>`);
        tagsBoxHash.append(tagElement);

        if (activeTagsBackup.includes(data[0].toLowerCase())) tagElement.addClass('active').css('background', '#166955');
        if (redTagsBackup.includes(data[0].toLowerCase())) tagElement.addClass('red').css('background', '#7D2A21');
    });

    const localePlayerCount = {};
    servers.forEach(data => {
        const locale = data.locale.toLowerCase();
        if (countryLocaleMap[locale]) localePlayerCount[locale] = (localePlayerCount[locale] || 0) + (parseInt(data.players.count) || 0);
    });

    Object.entries(localePlayerCount).forEach(([locale, playerCount]) => {
        const countryName = countryLocaleMap[locale];
        const [, countryCode] = locale.split('-');
        const countryElement = $(`<div class="filter-country" data-locale="${locale}"><h1><span class="fi fi-${countryCode.toLowerCase()}"></span>${countryName}</h1><h2>${playerCount}</h2></div>`);
        
        countriesBoxHash.append(countryElement);
        if (activeCountriesBackup.includes(locale)) countryElement.addClass('active').css('background', '#166955');
        if (redCountriesBackup.includes(locale)) countryElement.addClass('red').css('background', '#7D2A21');
    });

    activeTags = activeTagsBackup.filter(tag => tags.some(t => t[0].toLowerCase() === tag));
    redTags = redTagsBackup.filter(tag => tags.some(t => t[0].toLowerCase() === tag));
    activeCountries = activeCountriesBackup.filter(country => countryLocaleMap.hasOwnProperty(country));
    redCountries = redCountriesBackup.filter(country => countryLocaleMap.hasOwnProperty(country));

    $('.filter-tag').click(function() { handleTagClick($(this)); });
    $('.filter-country').click(function() { handleCountryClick($(this)); });

    toggleTrashButton(true); 
    toggleTrashButton(false);
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
    let newTopVW = ((position.top + offsetTop) / screenWidth) * 100;
    let newLeftVW = (position.left / screenWidth) * 100;

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