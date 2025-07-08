import './utils/loading.dat.js';
import { wait } from "./utils/tools.js";
import { parseColorCodes } from './utils/color.codeparser.js';
import { sortServers, renderTags } from './utils/search.filter.sort.js';
import { refreshServerInfo } from './services/server.info.js';
import './services/download.service.js';

async function tryLoadServers(retryCount = 3) {
    try {
        let attempts = 0;

        while (attempts < retryCount) {
            const response = await fetch('https://api.la5m.ir/servers');
            if (!response.ok) throw new Error(response.statusText);
            const getServers = await response.json();

            if (getServers !== 1 && typeof getServers?.data === "object") return getServers; else {
                await wait(1200);
                $(".app-servers-loading h3").html("سرور مرکزی در حال بارگذاری سرورهای فایوم است<br>لطفاً کمی صبر کنید<span class='loading-tag'>...</span>");
            }

            attempts++;
        }

        $(".app-servers-loading h3").html("اطلاعات سرور بارگزاری نشد ⌛");
        return false;
   } catch (error) {
        console.error('Error loading JSON:', error);
        $(".app-servers-loading h3").html("اتصال به سرور برای دریافت اطلاعات با شکست مواجه شد!<br>اینترنت خود را بررسی کنید و دوباره تلاش کنید.");
    }
}

async function UpdateServers() {
    const getServers = await tryLoadServers(50);

    if (getServers) {
        $("#servers span").html(getServers.count + " servers");

        const tagCounts = getServers.data.reduce((counts, server) => {
            (server.tags?.list || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
            return counts;
        }, {});
    
        const allTags = Object.entries(tagCounts).sort(([,a], [,b]) => b - a);
        let players = 0;

        const serversData = $(".app-server-list").empty();
        for (const server of getServers.data) {
            const licenseTag = server.licenseType ? `<img class="app-server-list-server-license-type" src="img/licenses/${server.licenseType}.svg" alt="License">` : '';
            const randomTags = (server.tags?.list || []).sort(() => 0.5 - Math.random()) .slice(0, Math.floor(Math.random() * 5)).map(tag => `<box><span>${tag}</span></box>`).join('');
            const tags = randomTags ? `<main-box class="app-server-list-server-tags hidden lg:flex">${randomTags}</main-box>`  : '';
            const randomLogo = Math.floor(Math.random() * 16) + 1;
            const logoUrl = `https://servers-frontend.fivem.net/api/servers/icon/${server.id}/${server.iconVersion}.png`;
            const serverName = parseColorCodes(server.projectName)

            players += server.players.count;
            const serverElement = $(`
                <div id="${server.id}" tags="${server.tags?.list}" class="app-server-list-main fade-in-row ${server.licenseType === "pt" ? "app-server-license-effect" : ''}">
                    <div>
                        <img class="app-server-list-server-logo" src="/img/logo-template/${randomLogo}.svg" alt="Server Logo">
                        ${server.offline ? "<offline><span>خاموش</span></offline>" : ''} 
                        <h1 class="app-server-list-server-name">${serverName == "" ? server.hostName : serverName}</h1>
                        <h2 class="app-server-list-server-text">${parseColorCodes(server.projectDescription)}</h2>
                    </div>
                    <div>
                        <span class="app-server-list-server-player-count min-w-[55px] lg:min-w-[80px] [min-inline-size:max-content]">${server.players.maxCount} / ${server.players.count}</span>
                        <img class="app-server-list-server-flag" src="img/icon/flag.png" alt="f">
                        ${licenseTag}
                        ${tags}
                    </div>
                </div>
            `);
        
            serversData.append(serverElement);
            setTimeout(() => serverElement.addClass('show'), 20);
            await wait(100);

            const serverLogo = serverElement.find(".app-server-list-server-logo");
            $('<img>').attr('src', logoUrl)
                .on('load', () => serverLogo.attr('src', logoUrl))
                .on('error', () => serverLogo.attr('src', `/img/logo-template/${randomLogo}.svg`));
        };

        $(".app-server-list").removeClass('fade-in-row, fade-in-row');
        $("#players span").html(players + " players");
        $(".app-servers-sort div").first().addClass("selected").siblings().removeClass("selected");
        sortServers("boost");
        renderTags(allTags);
        refreshServerInfo();
    };
}

$(document).ready(async function () {
    UpdateServers();
    setInterval(UpdateServers, 180000);
});