const gameName = $('meta[name="game-name"]').attr('content');

export function refreshServerInfo() {
    $(document).off("click", ".app-server-list-main");
    $(document).on("click", ".app-server-list-main", function(event) {
        if ($(event.target).closest('.app-server-list-server-active-boost').length) {
            const serverId = $(this).attr("id");
            window.location.href = `https://${gameName == "gta5" ? "la5m" : "la2m"}.ir/boost?cfxid=${serverId}`;
            return;
        } else $('.download-page').removeClass('hidden opacity-0 translate-y-8').addClass('opacity-100 translate-y-0');
    });
}