export function refreshServerInfo() {
    $(document).off("click", ".app-server-list-main");
    $(document).on("click", ".app-server-list-main", () => $('.download-page').removeClass('hidden opacity-0 translate-y-8').addClass('opacity-100 translate-y-0'));
}