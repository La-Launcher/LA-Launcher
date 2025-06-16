import { wait } from "./utils/tools.js";

$(document).ready(async function () {
    try {
        const response = await fetch('./json/errors.json');
        const data = await response.json();

        for (const error of data) {
            const row = $(`
                <tr class="accordion-header fade-in-row px-4 py-3 border-b border-[rgba(255,255,255,0.1)]" data-error="${error.code}">
                    <td class="px-4 py-3 border-[rgba(255,255,255,0.1)]">${error.code}</td>
                    <td class="px-4 py-3 border-[rgba(255,255,255,0.1)]">${error.message}</td>
                    <td class="px-4 py-3 border-[rgba(255,255,255,0.1)]">${error.solution}</td>
                </tr>
            `);

            $('#errorTableBody').append(row);

            setTimeout(() => row.addClass('show'), 20);

            await wait(100);
        }

        $("body").removeClass('fade-in-row, fade-in-row');
    } catch (error) {
        console.error('Error loading JSON:', error);
    }

    $('#searchInput').on('input', function () {
        const term = $(this).val().toLowerCase();
        $('#errorTableBody tr').each(function () {
            const row = $(this);
            const code = row.data('error')?.toString() || '';
            const text = row.text().toLowerCase();

            if (row.hasClass('accordion-header'))
                if (code.includes(term) || text.includes(term)) row.fadeIn(100); else row.fadeOut(50);
        });
    });
});