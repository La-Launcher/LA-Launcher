import './utils/loading.dat.js';

$(async function () {
    const sendStatusToLauncher = async (status, type, orderId = null) => {
        try {
            const result = await fetch(`http://127.0.0.1:7878/payment?status=${status}&${type}=${orderId}`, {method: "POST", headers: { "Content-Type": "application/json" }});

            const text = await result.text();
            console.log("Payment status sent:", status, type, orderId);

            return text === "ok";
        } catch(e) {
            console.error("Cannot send status to launcher:", e);
        }
    };

    const params = new URLSearchParams(window.location.search);
    let status = params.get("status");
    let savedTracking = localStorage.getItem("lastTrackingCode");

    if (status == "null") {
        localStorage.removeItem("lastPaymentSuccess");
        localStorage.removeItem("lastTrackingCode");
        status = false;
        savedTracking = null;
    }

    const redeem = params.get("redeem");
    const tracking = params.get("tracking") || redeem;
    const renderHtml = html => $("#content-box").html(html);
    const order = params.get("order");

    if (order == "true") {
        document.title = "LA Platform - Payment Success";
        localStorage.setItem("lastPaymentSuccess", "true");
        localStorage.setItem("lastTrackingCode", tracking);

        renderHtml(`
            <dotlottie-player src="../json/payment-success.lottie" speed="1" autoplay style="height:230px;opacity:0.7;margin:-20px 0;"></dotlottie-player>
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white">پرداخت با موفقیت انجام شد🥂</h2>
                <p class="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                    پرداخت شما با موفقیت انجام شد, با تشکر 🙏
                </p>
            </div>
            
            <div class="bg-white/5 rounded-lg px-4 py-3 w-full max-w-xs">
                <p class="text-white/80 text-sm mb-1">کد پیگیری:</p>
                <p class="text-white text-lg tracking-wider select-all font-['Rajdhani_SemiBold'] cursor-copy">${tracking}</p>
            </div>
            <p class="text-white/60 text-xs max-w-xs mt-[-10px]">
                لطفاً این کد را نگه دارید. در صورت بروز هرگونه مشکل یا سوال درباره سفارش، به آن نیاز خواهید داشت.
            </p>
        `);
        window.history.replaceState({}, document.title, window.location.pathname);
        return
    }

    const hadSuccess = localStorage.getItem("lastPaymentSuccess");
    const isSended = await sendStatusToLauncher(status || hadSuccess, (redeem || ((tracking?.match(/-/g) || []).length === 2)) ? "redeem" : "tracking", tracking || savedTracking);

    if (!status) {
        if (hadSuccess === "true") {
            const isGift = (savedTracking.match(/-/g) || []).length == 2;

            document.title = "LA Platform - Already Verified";
            renderHtml(`
                <dotlottie-player src="../json/payment-success.lottie" speed="1" autoplay style="height:200px;opacity:0.7;margin:-20px 0;"></dotlottie-player>

                <div>
                    <h2 class="text-2xl sm:text-3xl font-bold text-white">پرداخت شما قبلاً تایید شده است</h2>
                    <p class="text-white/60 text-md">نیازی به تایید دوباره نیست.</p>
                </div>

                ${savedTracking ? `
                    <div class="bg-white/5 rounded-lg px-4 py-3 w-full ${isGift ? 'flex flex-col 6px max-w-[80%]' : 'max-w-xs'}">
                        <p class="text-white/80 text-sm mb-1">${isGift ? 'لینک هدیه:' : 'کد پیگیری:'}</p>
                        ${isGift ? `<iframe src="https://la5m.ir/redeem?code=${savedTracking}&priview=true" class="h-[192px] rounded" title="Gift For You"></iframe>` : `<p class="text-white text-lg tracking-wider select-all font-['Rajdhani_SemiBold'] cursor-copy">${savedTracking}</p>`}
                    </div>

                    <p class="text-white/60 text-xs max-w-xs mt-[-10px]">${isGift ? 'لطفا بر روی صفحه بالا هاور کنید و لینک کارت هدیه را برای دوست خود ارسال کنید 🤍' : 'لطفاً این کد را نگه دارید. در صورت بروز هرگونه مشکل یا سوال درباره سرویس، به آن نیاز خواهید داشت.'}</p>
                ` : ''}
            `);
        } else {
            document.title = "LA Platform - Payment Error";
            renderHtml(`
                <dotlottie-player src="../json/payment-failed.lottie" speed="1" autoplay style="height:200px;opacity:0.7;margin:-20px 0;"></dotlottie-player>
                <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white">خطا در پردازش اطلاعات 🤨</h2>
                <p class="text-white/60 text-md mt-[10px]">
                    متأسفانه پرداخت با خطا مواجه شد.  
                    مبلغ پرداختی طی ۲۴ الی ۷۲ ساعت آینده به حساب شما بازگردانده می‌شود.  
                    در صورت نیاز با تیم پشتیبانی از طریق <a href="https://discord.la5m.ir" target="_blank" class="text-[#FCD53FCC] font-bold">تیکت دیسکورد</a> در ارتباط باشید.
                </p>
                </div>
            `);
        }
    } else if (status === "true" && tracking) {
        document.title = "LA Platform - Payment Success";
        localStorage.setItem("lastPaymentSuccess", "true");
        localStorage.setItem("lastTrackingCode", tracking);

        renderHtml(`
            <dotlottie-player src="../json/payment-success.lottie" speed="1" autoplay style="height:230px;opacity:0.7;margin:-20px 0;"></dotlottie-player>
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white">${redeem ? "لینک هدیه شما ثبت شد" : "سرویس شما فعال شد"} 🥂</h2>
                <p class="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                   ${redeem ? "لطفا لینک زیر را به دوست خود هدیه دهید 👇" : ` سرویس خریداری شده شما با موفقیت فعال شد! ${isSended ? 'اکنون می‌توانید این صفحه را ببندید و به لانچر بازگردید 🦾' : 'لانچر پاسخگو نبود! لطفاً آن را مجدد باز کنید و سرویس خود لذت ببرید 💪'}`}
                </p>
            </div>
            
            <div class="group relative bg-white/5 rounded-lg px-4 py-3 w-full ${redeem ? 'flex flex-col 6px max-w-[80%]' : 'max-w-xs'}">
                <p class="text-white/80 text-sm mb-1">${redeem ? "لینک هدیه:" : "کد پیگیری:"}</p>

                ${redeem ? `<iframe src="https://la5m.ir/redeem?code=${redeem}&priview=true" class="h-[192px] rounded" title="Gift For You"></iframe>` : `<p class="text-white text-lg tracking-wider select-all font-['Rajdhani_SemiBold'] cursor-copy">${tracking}</p>`}
            </div>

            <p class="text-white/60 text-xs max-w-xs mt-[-10px]">${redeem ? "لطفا بر روی صفحه بالا هاور کنید و لینک کارت هدیه را برای دوست خود ارسال کنید 🤍" :  "لطفاً این کد را نگه دارید. در صورت بروز هرگونه مشکل یا سوال درباره سرویس، به آن نیاز خواهید داشت."}</p>
            `);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "false") {
        localStorage.setItem("lastPaymentSuccess", "false");
        document.title = "LA Platform - Payment Failed";
        renderHtml(`
            <dotlottie-player src="../json/payment-failed.lottie" speed="1" autoplay style="height:230px;opacity:0.7;margin:-20px 0;"></dotlottie-player>
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white">پرداخت ناموفق بود 🤔</h2>
                <p class="text-white/60 text-md mt-[10px]">
                     پرداخت توسط شما لغو شد. لطفاً دوباره تلاش کنید و در صورت نیاز با تیم پشتیبانی از طریق <a href="https://discord.la5m.ir" target="_blank" class="text-[#FCD53FCC] font-semibold">تیکت دیسکورد</a> در ارتباط باشید.
                </p>
            </div>
        `);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});