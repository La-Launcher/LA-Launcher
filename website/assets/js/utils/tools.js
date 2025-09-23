export const wait = (min, max = null) => new Promise(res => setTimeout(res, max ? Math.random() * (max - min) + min : min));

export function setImage($el, urls) {
    if (!urls || urls.length === 0) return;

    let index = 0;

    function tryNext() {
        if (index >= urls.length) return;
        const url = urls[index++];
        if (!url) return tryNext();

        const img = new Image();
        img.onload = () => $el.attr("src", url);
        img.onerror = tryNext;
        img.src = url;
    }

    tryNext();
}