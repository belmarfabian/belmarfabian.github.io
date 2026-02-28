/* ===== Última publicación (migrated from inline) ===== */
document.addEventListener('DOMContentLoaded', function () {
    var articulo = document.querySelector('#articulos .scrollable-list li');
    var container = document.getElementById('ultima-pub');

    if (articulo && container) {
        var texto = articulo.innerHTML;
        var match = texto.match(/\((\d{4})\)\.\s*([^.]+\.)/);
        var año = match ? match[1] : '';
        var titulo = match ? match[2].trim() : '';
        var revista = articulo.querySelector('em')
            ? articulo.querySelector('em').textContent
            : '';
        var link = articulo.querySelector('a')
            ? articulo.querySelector('a').href
            : '';
        var abstract = articulo.dataset.abstract || '';

        container.innerHTML =
            '<p class="ultima-titulo">' + titulo + '</p>' +
            '<p class="ultima-meta"><em>' + revista + '</em> (' + año + ')' +
            (link ? ' <a href="' + link + '" class="ultima-link">Ver artículo →</a>' : '') +
            '</p>' +
            (abstract ? '<p class="ultima-abstract">' + abstract + '</p>' : '');
    }

    initTabs();
    initMetadata();
    initAbstracts();
    initSearch();
});

/* ===== Tabs ===== */
function initTabs() {
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var target = tab.getAttribute('data-tab');

            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            document.querySelectorAll('.tab-panel').forEach(function (panel) {
                panel.classList.remove('active');
            });
            var panel = document.getElementById('panel-' + target);
            if (panel) panel.classList.add('active');
        });
    });
}

/* ===== Metadata columns (year, journal, quartile, score) ===== */
function initMetadata() {
    var items = document.querySelectorAll('.scrollable-list li');

    items.forEach(function (li) {
        var text = li.textContent;

        // Extract year
        var yearMatch = text.match(/\((\d{4})\)/);
        var year = yearMatch ? yearMatch[1] : '';

        // Extract journal from <em>
        var emEl = li.querySelector('em');
        var journal = emEl ? emEl.textContent : '';
        if (journal.length > 25) {
            journal = journal.substring(0, 22) + '...';
        }

        // Optional: quartile and score from data attributes
        var quartile = li.dataset.quartile || '';
        var score = li.dataset.score || '';

        var meta = document.createElement('div');
        meta.className = 'pub-meta';

        if (year) {
            var yearSpan = document.createElement('span');
            yearSpan.className = 'pub-year';
            yearSpan.textContent = year;
            meta.appendChild(yearSpan);
        }

        if (journal) {
            var journalSpan = document.createElement('span');
            journalSpan.className = 'pub-journal';
            journalSpan.textContent = journal;
            meta.appendChild(journalSpan);
        }

        if (quartile) {
            var qSpan = document.createElement('span');
            qSpan.className = 'pub-quartile pub-quartile-' + quartile.toLowerCase();
            qSpan.textContent = quartile;
            meta.appendChild(qSpan);
        }

        if (score) {
            var sSpan = document.createElement('span');
            sSpan.className = 'pub-score';
            sSpan.textContent = score;
            meta.appendChild(sSpan);
        }

        if (meta.childNodes.length) {
            li.insertBefore(meta, li.firstChild);
        }
    });
}

/* ===== Abstracts (always open, side layout) ===== */
function initAbstracts() {
    var items = document.querySelectorAll('li[data-abstract]');

    items.forEach(function (li) {
        var abstract = li.getAttribute('data-abstract');
        if (!abstract) return;

        // Wrap citation content
        var wrapper = document.createElement('div');
        wrapper.className = 'pub-citation';
        while (li.firstChild) {
            wrapper.appendChild(li.firstChild);
        }
        li.appendChild(wrapper);

        // Abstract always visible
        var content = document.createElement('div');
        content.className = 'abstract-content';
        content.textContent = abstract;
        li.appendChild(content);

        li.classList.add('abstract-open');
    });
}

/* ===== Search/Filter ===== */
function initSearch() {
    var input = document.querySelector('.search-input');
    var counter = document.querySelector('.search-counter');
    if (!input) return;

    var sections = document.querySelectorAll('.tab-panel section');
    var allItems = [];

    sections.forEach(function (section) {
        var items = section.querySelectorAll('.scrollable-list li');
        items.forEach(function (li) {
            allItems.push({
                el: li,
                text: li.textContent.toLowerCase(),
                section: section
            });
        });
    });

    var totalCount = allItems.length;
    updateCounter(counter, totalCount, totalCount);

    var debounceTimer;
    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            filterPublications(input.value, allItems, sections, counter, totalCount);
        }, 150);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            input.value = '';
            filterPublications('', allItems, sections, counter, totalCount);
        }
    });
}

function filterPublications(query, allItems, sections, counter, totalCount) {
    var tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var visibleCount = 0;

    allItems.forEach(function (item) {
        var match = tokens.length === 0 || tokens.every(function (t) {
            return item.text.indexOf(t) !== -1;
        });
        if (match) {
            item.el.classList.remove('search-hidden');
            visibleCount++;
        } else {
            item.el.classList.add('search-hidden');
        }
    });

    sections.forEach(function (section) {
        var list = section.querySelector('.scrollable-list');
        if (!list) {
            section.classList.remove('section-hidden');
            return;
        }
        var visibleItems = list.querySelectorAll('li:not(.search-hidden)');
        if (visibleItems.length === 0 && tokens.length > 0) {
            section.classList.add('section-hidden');
        } else {
            section.classList.remove('section-hidden');
        }
    });

    updateCounter(counter, visibleCount, totalCount);
}

function updateCounter(counter, visible, total) {
    if (!counter) return;
    if (visible === total) {
        counter.textContent = total + ' publicaciones';
    } else {
        counter.textContent = visible + ' de ' + total + ' publicaciones';
    }
}

/* ===== Dark Mode ===== */
function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);
}

function updateThemeButton(theme) {
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.textContent = theme === 'dark' ? '◑' : '◐';
        btn.setAttribute('aria-label',
            theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
}
