import "./utils/loading.dat.js";
import showNotification from "./services/notification.service.js";
import { parseColorCodes } from "./utils/color.codeparser.js";
import { setImage } from "./utils/tools.js";

$(document).ready(async () => {
    const params = new URLSearchParams(window.location.search);
    const authKey = params.get("auth");
    if (!authKey) return (window.location.href = "/404");

    const gameName = $('meta[name="game-name"]').attr("content");
    $("#serverIcon").attr("src",`../img/logo-template/${Math.floor(Math.random() * 16) + 1}.svg`);

    const fetchJson = async (url, opts) => {
        const res = await fetch(url, opts);
        return res.json().catch(() => null);
    };

    const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${authKey}` };

    const data = await fetchJson("https://api.la5m.ir/stock/balance", { method: "GET", headers: authHeaders });
    if (!data) return (window.location.href = "/404");

    const { id, stock, price } = data;

    const serverData = await fetchJson(`https://api.la5m.ir/server/${id}?platform=${gameName}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

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
    $("#currents").html(Object.keys(stock).map((k) => `<div><span class="font-semibold text-[16px] text-[#dadbd0]">${stock[k]}</span>x ${k.replace(/^wg_/, "")}</div>`).join(" - "));

    const minStocks = 3;
    const maxStocks = 9999;

    const renderStockRows = (stockObj) => {
        const $row = $(".boost-row");
        const keys = Object.keys(stockObj).filter((k) => stockObj[k] >= 0);
        if (!keys.length) return $row.html("");

        $row.html(
            keys.map((k) => `
                <div dir="ltr" class="input-container flex items-center p-[8px_12px] bg-transparent border-[2px] border-white/20 rounded-[10px] focus-within:border-white/40 transition-colors duration-300 ease-in-out w-full" data-key="${k}">
                    <input type="number" min="${minStocks}" value="${minStocks}" class="deposit-input bg-transparent text-white text-right focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield] w-12" />x
                    <span class="text-white/50 select-none ml-[5px]">${k.replace(/^wg_/, "")} (<span class="price">0</span>T)</span>
                </div>`).join("")
        );

        $row.find(".input-container").each(function () {
            const $c = $(this);
            const key = $c.data("key");
            const $input = $c.find(".deposit-input");
            const $price = $c.find(".price");

            const clamp = (v) => Math.min(maxStocks, Math.max(minStocks, parseInt(v, 10) || minStocks));
            const paint = (v) => {
                v = clamp(v);
                $input.val(v);
                $price.text(((v * (price?.[key] || 0) * 1000) || 0).toLocaleString("en-IR"));
                $input.css("width", `${String(v).length || 2}ch`);
            };

            $input.on("input blur", () => paint($input.val()));
            $input.on("keypress", (e) => {
                const c = e.which || e.keyCode;
                if (c < 48 || c > 57) e.preventDefault();
            });

            $input.on("paste", (e) => {
                e.preventDefault();
                const t = ((e.originalEvent || e).clipboardData.getData("text") || "").replace(/[^\d]/g, "");
                paint(t);
            });
        });
    };

    renderStockRows(stock);

    const $paymentButton = $("a.cursor-pointer");

    const setLocked = (locked) => {
        $paymentButton
            .toggleClass("opacity-50 cursor-not-allowed", locked)
            .html(locked ? "درحال رفتن به درگاه پرداخت<span class='loading-tag'>...</span>" : "شارژ سپرده و رفتن به درگاه پرداخت");
        $(".deposit-input").prop("disabled", locked).css("opacity", locked ? "0.5" : "1");
    };

    const openWithoutReferrer = (url) => {
        const $a = $("<a>", { href: url, target: "_blank", rel: "noopener noreferrer" });

        $("body").append($a);
        $a[0].click();
        $a.remove();
        setLocked(false);
    };

    const buildStockPayload = () => {
        const newStock = {};

        $(".deposit-input").each(function () {
            const $inp = $(this);
            newStock[$inp.closest(".input-container").attr("data-key")] = String($inp.val() ?? "").trim() || minStocks;
        });

        return newStock;
    };

    const lockPaymentState = async () => {
        setLocked(true);
        try {
            const payload = buildStockPayload();
    
            const res = await fetchJson("https://api.la5m.ir/stock/create-invoice", { method: "POST", headers: authHeaders, body: JSON.stringify({ stock: payload }) });
            const paymentUrl = res?.payUrl;
            const message = res?.message;

            if (paymentUrl) return gameName === "gta5" ? (location.href = paymentUrl) : openWithoutReferrer(paymentUrl);
            throw new Error(message || "ساخت درگاه موفق نبود.");
        } catch (err) {
            console.error(err);
            showNotification("error", "خطا", "ارتباط با سرور برقرار نشد.", true);
            setLocked(false);
        }
    };

    $paymentButton.on("click", () => {
        if ($paymentButton.hasClass("cursor-not-allowed")) return;
        lockPaymentState();
    });

    $("#content-box").fadeOut(250, () => $("#content-box2").hide().removeClass("hidden").slideDown(250));
});