// import { wait } from "../utils/tools.js";
import showNotification from "./notification.service.js";

// $.getJSON("https://api.github.com/repos/LaPlatform/la-launcher/releases/latest").done(function (release) {
//     $(".downloadButton").removeClass("disabled");

//     let downloadUrl = release.assets[0].browser_download_url;

//     $(".downloadButton").attr("href", downloadUrl);
//     $("#buttonText").text("همین الان دانلود کن");
//     $("#buttonLoading").fadeOut(0);
//     $("#buttonIcon").fadeIn(200);

// }).fail(function () {
//     $(".downloadButton").addClass("disabled");
//     showNotification('error', 'خطا!', "مشکلی در بارگذاری لینک دانلود پیش آمده", true);
// });

$(".downloadButton").on("click", async function (e) {
    e.preventDefault();
    if ($(this).hasClass("disabled")) return;
    showNotification('error', 'خطا!', "لانچر هنوز متشر نشده است اعلامه دیسکورد را دنبال کنید.", true);

    // if ($(this).hasClass("disabled")) {
    //     showNotification('warning', 'اخطار!', "مشکلی در بارگزاری لیتک دانلود پیش آمده", false);
    //     await wait(1000);
    //     window.location.href = "https://github.com/LaPlatform/la-launcher/releases/latest";
    //     return
    // }

    // if ($(this).attr("header-data") == "download")
    //     showNotification('info', 'در حال دانلود', 'لانچر در حال بارگذاری است.', true);
    // else {
    //     $("#buttonText").text("صدور لینک دانلود");
    //     $("#buttonLoading").fadeIn(200);
    //     $("#buttonIcon").fadeOut(0);

    //     await wait(1000);
    //     $("#buttonText").text("همین الان دانلود کن");
    //     $("#buttonLoading").fadeOut(0);
    //     $("#buttonIcon").fadeIn(200).attr("alt", "dl")
    // }

    // window.location.href = $(".downloadButton").attr("href");
});