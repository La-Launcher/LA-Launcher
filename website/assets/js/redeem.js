import showNotification from "./services/notification.service.js";
const PLANS = { "wg_Super": "SUPER PRO", "wg_Pro": "PRO" };

$(document).ready(async function() {
    const params = new URLSearchParams(window.location.search);
    const redeemCode = params.get('code');

    if (!redeemCode) return window.location.href = '/404';

    const result = await fetch(`https://api.la5m.ir/gift/info?code=${encodeURIComponent(redeemCode)}`);
    if (result.status !== 200) {
        $("#content-box p").html("اتصال به سرور برقرار نشد!");
        setTimeout(() => {
            $("#content-box p").html("در حال بررسی مجدد<span class='loading-tag'>...</span>");
            setTimeout(() => window.location.reload(), 500);
        }, 1200);
        return;
    }

    const serverData = await result.json();
    if (!serverData) return window.location.href = '/404';

    $("#status").text(serverData.status ? "Gift used" : "Ready to use");
    $("#type").text(PLANS[serverData.plan] || "Unknown Plan");
    $("#date").html(new Date(serverData.purchasedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric"}));
    $("#price").text(serverData.price ? `${serverData.price}T` : "Free Gift");
    $("#redeem").text(redeemCode);
    $("#validity").text(formatValidity(serverData.validityDays));
    $('#content-box').fadeOut(200, () => $('#card').fadeIn(500).css('display', 'flex'));

    if (params.get('priview') == "true") {
        $("body").append(`
            <div class="group absolute inset-0 w-full h-full z-10 flex items-center justify-center backdrop-blur-0 transition duration-200 ease-out hover:backdrop-blur-[40px]">
                <button dir="ltr" type="button" class="copy-gift-link inline-flex items-center justify-center cursor-pointer rounded-[7px] border-2 border-white/25 transform transition duration-200 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto hover:border-white/70 hover:bg-white/10 px-6 py-3">
                    <span class="font-['Rajdhani_SemiBold'] text-[30px] text-white/25 uppercase leading-none transition duration-200 ease-out group-hover:text-white">Copy gift link</span>
                </button>
            </div>
        `);

        $(document).on('click', '.copy-gift-link', async function (e) {
            e.preventDefault();

            const $btn = $(this);
            const link = window.location.href.replace('&priview=true', '');
            const $label = $btn.find('span');
            const original = $label.text();

            const done = () => {
                $label.text('Copied to clipboard!');
                setTimeout(() => $label.text(original), 1500);
            };

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(link);
                    done();
                } else {
                    throw new Error('Clipboard API not available');
                }
            } catch (err) {
                const $temp = $('<input>').val(link).appendTo('body');
                $temp[0].select();
                document.execCommand('copy');
                $temp.remove();
                done();
            }
        });
    }

    function formatValidity(value) {
        const days = Number(value);
        if (!Number.isFinite(days) || days < 0) return "";

        const years = Math.floor(days / 365);
        const remain = days % 365;
        const months = Math.floor(remain / 30);
        const daysLeft = remain % 30;

        const parts = [];
        if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
        if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
        if (daysLeft) parts.push(`${daysLeft} day${daysLeft > 1 ? "s" : ""}`);
        if (!parts.length) parts.push("0 day");

        return parts.join(" and ") + " validity";
    }

    const $card = $('#card');
    const $scene = $('.scene');

    $scene.on('mousemove', e => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        $card.css('transform', `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`);
        $card.css('filter', `drop-shadow(${-xAxis * 0.2}px ${-yAxis * 0.2}px 0px #000000ff)`);
    });

    $scene.on('mouseenter', () => $card.css('transition', 'none'));

    $scene.on('mouseleave', () => {
        $card.css({
            transition: 'transform 0.8s ease, filter 0.8s ease',
            transform: 'rotateY(0deg) rotateX(0deg)',
            filter: 'drop-shadow(0.156vw 0.156vw 0vw #000000ff)'
        });
    });

    const $el = $('.use');
    if (!$el.length) return;

    const ripSound = document.getElementById('ripSound');
    let soundPrimed = false, startY = 0, lastY = 0, velocity = 0, isDragging = false, isTorn = false, hasDropped = false;

    const THRESHOLD = 110;
    const TEAR_LOCK = 140;

    function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function primeSound() {
        if (!ripSound || soundPrimed) return;
        ripSound.volume = 0;
        ripSound.play().then(() => {
            ripSound.pause();
            ripSound.currentTime = 0;
            ripSound.volume = 1;
            soundPrimed = true;
        }).catch(() => {});
    }

    function pointerDown(e) {
        if (hasDropped) return;
        primeSound();
        isDragging = true;
        isTorn = false;
        velocity = 0;
        $el.css('transition', 'none');
        startY = lastY = getY(e);
    }

    function pointerMove(e) {
        if (!isDragging || hasDropped) return;
        const y = getY(e);
        const delta = y - startY;
        velocity = y - lastY;
        lastY = y;

        let d = delta < 0 && !isTorn ? 0 : delta;

        if (!isTorn && d >= TEAR_LOCK) {
            triggerTearAndDrop();
            return;
        }

        if (d >= 0) $el.css('transform', `translateY(${d}px) rotate(${d / 40}deg)`);
    }

    function pointerUp() {
        if (!isDragging || hasDropped) return;
        isDragging = false;

        if (isTorn) return;

        const totalDrag = lastY - startY;

        if (totalDrag > THRESHOLD || velocity > 15) drop();
        else {
            $el.css({
                transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transform: "translateY(0) rotate(0)"
            });
        }
    }

    function triggerTearAndDrop() {
        if (hasDropped) return;
        isTorn = true;
        hasDropped = true;
        if (ripSound) {
            try { ripSound.currentTime = 0; ripSound.play(); } catch (e) {}
        }
        drop();
    }

    function typeStatusTemp(newText, options = {}) {
        const $el = $('#type');
        const oldText = $el.text();
        const speed = options.speed || 40;
        const hold  = options.hold  || 2000;

        let i = 0;
        $el.text('').attr('data-text', '');

        const typeForward = setInterval(() => {
            const character = newText.slice(0, i++);
            $el.text(character).attr('data-text', character);
            if (i > newText.length) {
                clearInterval(typeForward);

                setTimeout(() => {
                    let j = 0;
                    $el.text('').attr('data-text', '');

                    const typeBackward = setInterval(() => {
                        const char = oldText.slice(0, j++);
                        $el.text(char).attr('data-text', char);
                        if (j > oldText.length) {
                            clearInterval(typeBackward);
                        }
                    }, speed);
                }, hold);
            }
        }, speed);
    }

    async function checkVerifyLauncher() {
        try {
            const result = await fetch("http://127.0.0.1:7878/redeem", { method: "GET", headers: { "Content-Type": "application/json" }});

            const text = await result.text();
            console.log("status redeem gift:", text);

            return text === "ok";
        } catch (error) {
            console.error("Cannot send status to launcher:", error);
            return false;
        }
    }

    function openLauncherWithRedeem(code) {
        let opened = false;

        $(window).one('blur',() => opened = true);

        window.location.href = "la-launcher://redeem/" + encodeURIComponent(code);
        alert("la-launcher://redeem/" + encodeURIComponent(code))

        $('#status').text('CHECKING');
        $('#status-spinner').removeClass('hidden');
        
        const interval = setInterval(async () => {
            const ok = await checkVerifyLauncher();
            if (ok) {
                clearInterval(interval);

                typeStatusTemp('ACTIVATED', {
                    speed: 60,
                    hold: 2000 
                });

                opened = true;
                $('#status').text('REDEEMED');
                $('#status-spinner').addClass('hidden');
            }
        }, 1200);

        setTimeout(function () {
            if (!opened) {
                showNotification("error", "خطا!", "لانچر روی سیستم شما شناسایی نشد؛ لطفاً کد هدیه را به صورت دستی در لانچر وارد کنید.", true);
                $('#status').text('Canceled');
                $('#status-spinner').addClass('hidden');
                setTimeout(() => {
                    $('#status').text('Refreshing to try again');
                    window.location.reload()
                }, 2500);
            }
        }, 5000);
    }

    function drop() {
        $el.addClass('use-falling');
        $el.css('transition', '');
        $el.one('transitionend', () => {
            $el.remove();
            openLauncherWithRedeem("7MKQ-94YJ-0M21");
        });
    }

    $el.on('mousedown touchstart', pointerDown);
    $(window).on('mousemove touchmove', pointerMove);
    $(window).on('mouseup touchend', pointerUp);
});