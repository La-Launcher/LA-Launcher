const mobileMenu = $('#mobile-menu');

$('.mobile-header').click(() => {
    mobileMenu.removeClass('opacity-0 pointer-events-none').addClass('opacity-100 pointer-events-auto');
    $('body').addClass('overflow-hidden');
});

$('.mobile-header-exit').click(() => {
    mobileMenu.removeClass('opacity-100 pointer-events-auto').addClass('opacity-0 pointer-events-none');
    $('body').removeClass('overflow-hidden');
});

$(window).resize(() => {
    if ($(window).width() >= 768 && mobileMenu.hasClass('opacity-100')) {
        mobileMenu.removeClass('opacity-100 pointer-events-auto').addClass('opacity-0 pointer-events-none');
        $('body').removeClass('overflow-hidden');
    }
}).resize();