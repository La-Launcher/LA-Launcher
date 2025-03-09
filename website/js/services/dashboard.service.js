import showNotification from "./notification.service.js";

$(".dashboard").on("click", async function(e) {
    e.preventDefault();
    showNotification('alert', 'داشبورد', "سیستم داشبورد هنوز در دست توسعه است و به‌زودی با ویژگی‌های خاص منتشر خواهد شد.", false);
});