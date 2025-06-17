export function parseColorCodes(text = "") {
    if (typeof text === "string" && text === "") 
        return ""; 
    else if (!text) return `⚠️ Server is loading or failed to load ⚠️`;
    

    const colorMap = {
        '^0': '#FFFFF0',
        '^1': '#fccbc7',
        '^2': '#b5dfb7',
        '^3': '#fffbd4',
        '^4': '#d3eafd',
        '^5': '#92dcfe',
        '^6': '#d88be5',
        '^7': '#FFFFF0',
        '^8': '#ffcbbb',
        '^9': '#ebebeb' 
    };

    return text.replace(/\^([0-9])/g, (match, p1) => {
        const color = colorMap[`^${p1}`] || '#FFFFF0';
        return `</span><span style="color: ${color}">`;
    }).replace(/^/, '<span>').concat('</span>');
}

export function removeColorCodes(text) {
    if (!text || typeof text === "string" && text === "") 
        return `⚠️ Server is loading or failed to load ⚠️`;
    
    return text.replace(/\^\d/g, "");
}