import showNotification from "./notification.service.js";

const animateCounter = (element, target) => {
    if (!target) return;
    $({ count: 0 }).animate({ count: target }, {
        duration: Math.max(1000, Math.min(5000, target * 20)),
        easing: 'swing',
        step: now => element.text(Math.ceil(now)),
        start: () => element.addClass('animate'),
        complete: () => element.removeClass('animate')
    });
};

const updatePlatform = () => $.getJSON("https://api.la5m.ir/platform-info").done(({ servers, activePlayers, totalInstalls }) => {
    if (servers === 1) return;
    $('.conuts').html("0").each((i, el) => 
        animateCounter($(el), [servers, activePlayers, totalInstalls][i])
    );
}).fail(() => showNotification('error', 'خطا!', 'مشکلی در دریافت اطلاعات سرور پیش آمده, اینترنت خود را بررسی کنید.', true));

setInterval(updatePlatform, 120000);
updatePlatform();