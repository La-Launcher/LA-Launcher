$(document).ready(function() {
    const $modal = $('#carouselModal');
    const $smallImageList = $('ul.flex.touch-pan-y.touch-pinch-zoom');
    const $modalImageList = $('#carouselModal ul');
    const $thumbnails = $('.group.flex-1.py-2');
    const $modalThumbnails = $('#carouselModal .thumbnail');
    const $smallImages = $smallImageList.find('button');
    let currentIndex = 0;
    let modalIndex = 0;  
    const totalSlides = $thumbnails.length;
    let isDraggingSmall = false;
    let isDraggingModal = false;
    let startPos = 0;
    let smallTranslate = 0;
    let modalTranslate = 0;
    let dragStarted = false;

    $smallImages.on({
        mousedown: function(e) {
            dragStarted = true;
            startPos = e.pageX;
            smallTranslate = parseFloat($smallImageList.css('transform').split(',')[4] || 0);
            $smallImageList.css('transition', 'none');
            e.preventDefault();
        },
        mouseup: function(e) {
            if (!dragStarted) return;
            dragStarted = false;
            const diff = e.pageX - startPos;
            if (Math.abs(diff) < 10) {
                $modal.removeClass('hidden').attr('data-state', 'open');
                $('body').addClass('overflow-hidden');
                currentIndex = $(this).parent().index();
                modalIndex = currentIndex;
                updateSlidePosition($smallImageList, currentIndex);
                updateSlidePosition($modalImageList, modalIndex);
                currentIndex = 0;
                modalIndex = 0;
                moveToSlide('modal');
            } else
                handleDragEnd(diff, $smallImageList, 'small');
        }
    });

    $('#closeCarousel, #backdrop').click(function() {
        $modal.attr('data-state', 'closed');
        setTimeout(() => {
            $modal.addClass('hidden');
            $('body').removeClass('overflow-hidden');
        }, 300);
    });

    $thumbnails.click(function() {
        currentIndex = $(this).index();
        moveToSlide('small');
    });

    $modalThumbnails.click(function() {
        modalIndex = $(this).index();
        moveToSlide('modal');
    });

    function moveToSlide(type) {
        if (type === 'small') {
            updateSlidePosition($smallImageList, currentIndex);
            $thumbnails.removeAttr('data-selected').eq(currentIndex).attr('data-selected', 'true');
        } else {
            updateSlidePosition($modalImageList, modalIndex);
            $modalThumbnails.removeAttr('data-selected').eq(modalIndex).attr('data-selected', 'true');
        }
    }

    function updateSlidePosition($list, index) {
        const slideWidth = $list.find('li').outerWidth();
        $list.css({
            transition: 'transform 0.4s ease-out',
            transform: `translate3d(${-slideWidth * index}px, 0, 0)`
        });
    }

    $smallImageList.on({
        mousedown: function(e) {
            isDraggingSmall = true;
            startPos = e.pageX;
            smallTranslate = parseFloat($smallImageList.css('transform').split(',')[4] || 0);
            $smallImageList.css('transition', 'none');
            e.preventDefault();
        },
        mousemove: function(e) {
            if (!isDraggingSmall) return;
            $smallImageList.css('transform', `translate3d(${smallTranslate + e.pageX - startPos}px, 0, 0)`);
        },
        mouseup: function(e) {
            if (!isDraggingSmall) return;
            handleDragEnd(e.pageX - startPos, $smallImageList, 'small');
        },
        touchstart: function(e) {
            isDraggingSmall = true;
            startPos = e.touches[0].pageX;
            smallTranslate = parseFloat($smallImageList.css('transform').split(',')[4] || 0);
            $smallImageList.css('transition', 'none');
        },
        touchmove: function(e) {
            if (!isDraggingSmall) return;
            $smallImageList.css('transform', `translate3d(${smallTranslate + e.touches[0].pageX - startPos}px, 0, 0)`);
        },
        touchend: function(e) {
            if (!isDraggingSmall) return;
            handleDragEnd(e.changedTouches[0].pageX - startPos, $smallImageList, 'small');
        }
    });

    $modalImageList.on({
        mousedown: function(e) {
            isDraggingModal = true;
            startPos = e.pageX;
            modalTranslate = parseFloat($modalImageList.css('transform').split(',')[4] || 0);
            $modalImageList.css('transition', 'none');
            e.preventDefault();
        },
        mousemove: function(e) {
            if (!isDraggingModal) return;
            $modalImageList.css('transform', `translate3d(${modalTranslate + e.pageX - startPos}px, 0, 0)`);
        },
        mouseup: function(e) {
            if (!isDraggingModal) return;
            handleDragEnd(e.pageX - startPos, $modalImageList, 'modal');
        },
        touchstart: function(e) {
            isDraggingModal = true;
            startPos = e.touches[0].pageX;
            modalTranslate = parseFloat($modalImageList.css('transform').split(',')[4] || 0);
            $modalImageList.css('transition', 'none');
        },
        touchmove: function(e) {
            if (!isDraggingModal) return;
            $modalImageList.css('transform', `translate3d(${modalTranslate + e.touches[0].pageX - startPos}px, 0, 0)`);
        },
        touchend: function(e) {
            if (!isDraggingModal) return;
            handleDragEnd(e.changedTouches[0].pageX - startPos, $modalImageList, 'modal');
        }
    });

    function handleDragEnd(diff, $list, type) {
        if (type === 'small') {
            isDraggingSmall = false;
            if (diff < -50 && currentIndex < totalSlides - 1) currentIndex++;
            else if (diff > 50 && currentIndex > 0) currentIndex--;
            smallTranslate = -currentIndex * $list.find('li').outerWidth();
            moveToSlide('small');
        } else {
            isDraggingModal = false;
            if (diff < -50 && modalIndex < totalSlides - 1) modalIndex++;
            else if (diff > 50 && modalIndex > 0) modalIndex--;
            modalTranslate = -modalIndex * $list.find('li').outerWidth();
            moveToSlide('modal');
        }
    }

    $(window).resize(() => {
        updateSlidePosition($smallImageList, currentIndex);
        updateSlidePosition($modalImageList, modalIndex);
    });

    $(document).keydown(function(e) {
        if (!$modal.hasClass('hidden')) {
            if (e.key === 'ArrowLeft' && modalIndex > 0) modalIndex--;
            else if (e.key === 'ArrowRight' && modalIndex < totalSlides - 1) modalIndex++;
            else if (e.key === 'Escape') $('#closeCarousel').click();
            moveToSlide('modal');
        }
    });

    updateSlidePosition($smallImageList, currentIndex);
    updateSlidePosition($modalImageList, modalIndex);
});