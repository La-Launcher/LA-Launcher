let dotCount = 0;
let intervalId = null;

function updateLoadingTitles() {
    dotCount = (dotCount + 1) % (3 + 1);
    
    $('.loading-tag').each(function() {
        $(this).text('.'.repeat(dotCount));
    });
}

intervalId = setInterval(updateLoadingTitles, 500);

const observer = new MutationObserver(() => {
    const loadingTags = $('.loading-tag');
    
    if (loadingTags.length === 0) {
        clearInterval(intervalId);
        intervalId = null;
    } else if (!intervalId) {
        intervalId = setInterval(updateLoadingTitles, 500);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});