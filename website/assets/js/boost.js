import './utils/loading.dat.js';
import showNotification from "./services/notification.service.js";
import { parseColorCodes } from './utils/color.codeparser.js';
import { setImage } from './utils/tools.js';

$(document).ready(async function() {
    const params = new URLSearchParams(window.location.search);
    const serverId = params.get('id');
    if (!serverId) return window.location.href = '/404';

    const gameName = $('meta[name="game-name"]').attr('content');
    console.log(`Loading servers for game: ${gameName}`);
    $('#serverIcon').attr('src', `../img/logo-template/${Math.floor(Math.random() * 16) + 1}.svg`);

    const result = await fetch(`https://api.la5m.ir/server/${serverId}?platform=${gameName}`, {method: "GET", headers: { "Content-Type": "application/json" }});
    const serverData = await result.json();

   if (!serverData?.id) {
        $("#content-box p").html("مشکلی در پردازش سرور مورد نظر پیش آمده, احتمالا سرور مورد نظر خاموش است!");
        setTimeout(() => {
            $("#content-box p").html("در حال بررسی مجدد<span class='loading-tag'>...</span>");
            setTimeout(() => window.location.reload(), 500);
        }, 1200);
        return;
    }

    setImage($("#serverBanner"), [serverData.banners?.detail, serverData.banners?.connecting]);
    setImage($("#serverBannerMain"), [serverData.banners?.connecting, serverData.banners?.detail]);
    setImage($("#serverIcon"), [`https://servers-frontend.fivem.net/api/servers/icon/${serverData.id}/${serverData.iconVersion}.png`]);

    $("#serverName").html(parseColorCodes(serverData.projectName));
    $("#serverBoost").text(serverData.boost);

    const $boostInput = $('#boostInput');
    const $price = $('#price');
    const $paymentButton = $('a.cursor-pointer');
    const pricePerBoost = 9000;
    const minBoosts = 10;

    function updatePriceDisplay(boostCount) {
        $price.text((boostCount * pricePerBoost).toLocaleString('en-IR'));
    }

    function adjustInputWidth() {
        const valueLength = $boostInput.val().length || 2;
        $boostInput.css('width', `${valueLength}ch`);
    }

    async function lockPaymentState() {
        $paymentButton.addClass("opacity-50 cursor-not-allowed").html("درحال رفتن به درگاه پرداخت<span class='loading-tag'>...</span>");
        $boostInput.prop('disabled', true).css('opacity', '0.5');

        try {
            const response = await fetch('https://api.la5m.ir/boost/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    count: parseInt($boostInput.val().trim()) || minBoosts,
                    serverId
                })
            });

            const { paymentUrl, message } = await response.json();

            if (paymentUrl) return location.href = paymentUrl;
            throw new Error(message || "ساخت درگاه موفق نبود.");
        } catch (err) {
            console.error(err);
            showNotification('error', 'خطا', "ارتباط با سرور برقرار نشد.", true);
            $paymentButton.removeClass("opacity-50 cursor-not-allowed").html("خرید بوست و رفتن به درگاه پرداخت");
            $boostInput.prop('disabled', false).css('opacity', '1');
        }
    }

    updatePriceDisplay(minBoosts);
    adjustInputWidth();

    $boostInput.on('input', function() {
        let boostCount = parseInt($(this).val()) || minBoosts;
        if (boostCount < minBoosts) {
            boostCount = minBoosts;
            $(this).val(minBoosts);
        }
        updatePriceDisplay(boostCount);
        adjustInputWidth();
    });

    $boostInput.on('keypress', function(e) {
        const charCode = e.which || e.keyCode;
        if (charCode < 48 || charCode > 57) e.preventDefault();
    });

    $boostInput.on('paste', function(e) {
        e.preventDefault();
        const pastedData = (e.originalEvent || e).clipboardData.getData('text/plain');
        const numericValue = pastedData.replace(/[^\d]/g, '');
        let boostCount = numericValue ? parseInt(numericValue) : minBoosts;
        if (boostCount < minBoosts) boostCount = minBoosts;
        $(this).val(boostCount);
        updatePriceDisplay(boostCount);
        adjustInputWidth();
    });

    $boostInput.on('blur', function() {
        let boostCount = parseInt($(this).val()) || minBoosts;
        if (boostCount < minBoosts) {
            boostCount = minBoosts;
            $(this).val(minBoosts);
        }
        updatePriceDisplay(boostCount);
        adjustInputWidth();
    });

    $paymentButton.on('click', function(e) {
        if ($paymentButton.hasClass("cursor-not-allowed")) return;
        lockPaymentState();
    });

    $("#content-box").fadeOut(250, () => $("#content-box2").hide().removeClass("hidden").slideDown(250));
});