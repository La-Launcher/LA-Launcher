const showNotification = (type = 'info', title = '', text = '', closeButton = true) => {
    let $notification = $('#notification'), $icon = $notification.find('.icon'), $content = $notification.find('.content'), $close = $notification.find('.close');
    let config = {
        error: { icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-600"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>', color: 'text-red-700' },
        warning: { icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-600"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>', color: 'text-yellow-700' },
        alert: { icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-orange-600"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>', color: 'text-orange-700' },
        info: { icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>', color: 'text-green-700' }
    }[type] || config.info;
    
    $icon.html(config.icon);
    $content.html(`<p class="${config.color} text-lg font-extrabold">${title}</p><p class="text-gray-600 text-sm font-medium mt-1">${text}</p>`);
    
    $close.html(closeButton ? '<button type="button" class="close-btn flex items-center gap-2 border rounded-md px-3 py-1 bg-[rgba(57,57,57,0.1)] border-[#33333385] text-[#ffffffa3] hover:bg-[rgba(57,57,57,0.35)] transition"><span class="font-medium">بستن</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg></button>' : '');
    
    $notification.hasClass('opacity-100') ? $notification.removeClass('opacity-100 translate-y-0').addClass('opacity-0 -translate-y-full') && setTimeout(() => $notification.removeClass('opacity-0 -translate-y-full').addClass('opacity-100 translate-y-0'), 500) : $notification.removeClass('opacity-0 -translate-y-full').addClass('opacity-100 translate-y-0');
    setTimeout(() => $notification.removeClass('opacity-100 translate-y-0').addClass('opacity-0 -translate-y-full'), 93000);
}

$(document).on('click', '.close-btn', () => $('#notification').removeClass('opacity-100 translate-y-0').addClass('opacity-0 -translate-y-full'));

export default showNotification;