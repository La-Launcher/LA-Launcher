import showNotification from "./services/notification.service.js";

$(".vip1-btn, .vip2-btn").on("click", async function(e) {
    e.preventDefault();
    showNotification('alert', 'سیستم', "سیستم اشتراک هنوز در دست توسعه است و برای خرید به دیسکورد مراجعه فرمایید.", false);
});