import showNotification from "./services/notification.service.js";
import './utils/loading.dat.js';

$(document).ready(() => {
    const form = $("#donation-form"),
        info = $("#donation-info"),
        name = form.find("input[placeholder*='نام']"),
        msg = form.find("textarea"),
        amount = form.find("input[placeholder*='مبلغ']"),
        donateBtn = form.find("a:contains('رفتن به درگاه بانکی')");

    // const inputs = $('#phone-inputs input');

    // inputs.on('input', function () {
    //     const $this = $(this);
    //     let val = $this.val().replace(/\D/g, '').charAt(0) || '';

    //     if (inputs.index(this) === 0 && val !== '9') {
    //         $this.val('');
    //         return;
    //     }

    //     $this.val(val);

    //     if (val) {
    //         const next = inputs.eq(inputs.index(this) + 1);
    //         if (next.length) next.focus();
    //     }
    // });

    // inputs.on('keydown', function (e) {
    //     const $this = $(this);
    //     const index = inputs.index(this);

    //     if (e.key === 'Backspace') {
    //         if (!$this.val() && index > 0) {
    //             inputs.eq(index - 1).focus().val('');
    //             e.preventDefault();
    //         } else {
    //             $this.val('');
    //             e.preventDefault();
    //         }
    //     }

    //     if (e.key === 'ArrowLeft' && index > 0) {
    //         inputs.eq(index - 1).focus();
    //         e.preventDefault();
    //     }

    //     if (e.key === 'ArrowRight' && index < inputs.length - 1) {
    //         inputs.eq(index + 1).focus();
    //         e.preventDefault();
    //     }
    // });

    $("a:contains('حمایت مالی'):first").on("click", e => {
        e.preventDefault();
        info.fadeOut(250, () => form.hide().removeClass("hidden").slideDown(250));
    });

    const formatAmount = val =>
        val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " تومان";

    form.find("button").on("click", function () {
        amount.val(formatAmount($(this).text()));
        validate();
    });

    amount.on("input", function () {
        let val = $(this).val()
            .replace(/\s*تومان\s*/g, "")
            .replace(/,/g, "")
            .replace(/\D/g, "")
            .replace(/^0+/, "");
        $(this).val(val ? formatAmount(val) : "");
        validate();
    });

    amount.on("keydown click", function () {
        setTimeout(() => {
            const pos = this.value.indexOf(" تومان");
            if (this.selectionStart > pos) this.setSelectionRange(pos, pos);
        });
    });

    name.on("input", function () {
        const filtered = $(this).val().replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "");
        if (filtered !== $(this).val()) $(this).val(filtered);
        validate();
    });

    function validate() {
        const nameValid = name.val().trim().length > 0;
        const amountVal = amount.val().replace(/\s*تومان\s*/g, "").replace(/,/g, "");
        const amountValid = amountVal.length > 0 && !isNaN(amountVal) && +amountVal > 0;
        donateBtn.toggleClass("opacity-50 cursor-not-allowed", !(nameValid && amountValid));
    }

    msg.on("input", validate);
    validate();

    donateBtn.on("click", e => {
        if (donateBtn.hasClass("cursor-not-allowed")) return;

        e.preventDefault();

        const data = {
            name: name.val().trim(),
            message: msg.val().trim(),
            amount: amount.val().replace(/\s*تومان\s*/g, "").replace(/,/g, "").trim()
        };

        if (!data.name || !data.amount) return;
        if (data.amount < 100000) return showNotification('alert', 'مبلغ حمایتی', "مبلغ کمتر از <span class='text-[#fFF7]'>100,000 تومان</span> مجاز نمی باشد.", false);
        data.amount *= 10;

        donateBtn.addClass("opacity-50 cursor-not-allowed").html('در حال انتقال به درگاه بانکی<span class="loading-tag">...</span>');

        startDonationProcess(data);
    });

    async function startDonationProcess(data) {
        try {
            const response = await fetch('https://api.la5m.ir/donate/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.paymentUrl) 
                window.location.href = result.paymentUrl;
            else {
                showNotification('error', 'خطا', result.message || "ساخت درگاه موفق نبود.", true);
                donateBtn.html("خطا 😨").removeClass("opacity-50 cursor-not-allowed");
            }
        } catch (err) {
            console.error(err);
            showNotification('error', 'خطا', "ارتباط با سرور برقرار نشد.", true);
        }
    }
});
