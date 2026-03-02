/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function () {
    initUltimaPub();
    initUltimaPrensa();
    initTabs();
    initMetadata();
    initAbstracts();
    initSearch();
    initUpdateDate();
    initBackToTop();
    initTimeline();
    initCitations();
    initEqualHeight();
});

/* ===== Última publicación (auto from first article) ===== */
function initUltimaPub() {
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
}

/* ===== Última prensa (auto from first press item) ===== */
function initUltimaPrensa() {
    var prensaItem = document.querySelector('#prensa .scrollable-list li');
    var container = document.getElementById('ultima-prensa');

    if (prensaItem && container) {
        var texto = prensaItem.innerHTML;
        var match = texto.match(/\((\d{4})\)\.\s*([^.]+\.)/);
        var titulo = match ? match[2].trim() : '';
        var emEl = prensaItem.querySelector('em');
        var medio = emEl ? emEl.textContent : '';
        var linkEl = prensaItem.querySelector('a');
        var link = linkEl ? linkEl.href : '';
        var yearMatch = texto.match(/\((\d{4})\)/);
        var año = yearMatch ? yearMatch[1] : '';

        container.innerHTML =
            '<p class="ultima-prensa-titulo">' + titulo + '</p>' +
            '<p class="ultima-prensa-meta"><em>' + medio + '</em> (' + año + ')' +
            (link ? ' <a href="' + link + '" class="ultima-link">Ver →</a>' : '') +
            '</p>';
    }
}

/* ===== Tabs with item counts ===== */
function initTabs() {
    var tabs = document.querySelectorAll('.tab');

    // Add item counts to each tab
    tabs.forEach(function (tab) {
        var target = tab.getAttribute('data-tab');
        var panel = document.getElementById('panel-' + target);
        if (panel) {
            var items = panel.querySelectorAll('.scrollable-list li');
            var cards = panel.querySelectorAll('.project-card');
            var count = items.length + cards.length;
            if (count > 0) {
                var countSpan = document.createElement('span');
                countSpan.className = 'tab-count';
                countSpan.textContent = count;
                tab.appendChild(countSpan);
            }
        }
    });

    // Tab click handlers
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

/* ===== Journal database (quartile = best SJR quartile, citescore) ===== */
var JOURNAL_DB = {
    'Societies': { quartile: 'Q2', citescore: 3.0 },
    'Ethnic and Racial Studies': { quartile: 'Q1', citescore: 5.5 },
    'Policy Studies': { quartile: 'Q1', citescore: 5.8 },
    'Public Integrity': { quartile: 'Q1', citescore: 1.9 },
    'Politics': { quartile: 'Q1', citescore: 4.8 },
    'Social Sciences': { quartile: 'Q2', citescore: 3.1 },
    'Política y Sociedad': { quartile: 'Q3', citescore: 0.9 }
};

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
        var journalFull = emEl ? emEl.textContent : '';
        var journalDisplay = journalFull;
        if (journalDisplay.length > 25) {
            journalDisplay = journalDisplay.substring(0, 22) + '...';
        }

        // Lookup quartile and citescore from database, fallback to data attributes
        var dbEntry = JOURNAL_DB[journalFull] || {};
        var quartile = li.dataset.quartile || dbEntry.quartile || '';
        var citescore = li.dataset.score || (dbEntry.citescore ? 'CiteScore ' + dbEntry.citescore : '');

        var meta = document.createElement('div');
        meta.className = 'pub-meta';

        if (year) {
            var yearSpan = document.createElement('span');
            yearSpan.className = 'pub-year';
            yearSpan.textContent = year;
            meta.appendChild(yearSpan);
        }

        if (journalDisplay) {
            var journalSpan = document.createElement('span');
            journalSpan.className = 'pub-journal';
            journalSpan.textContent = journalDisplay;
            meta.appendChild(journalSpan);
        }

        if (quartile) {
            var qSpan = document.createElement('span');
            qSpan.className = 'pub-quartile pub-quartile-' + quartile.toLowerCase();
            qSpan.textContent = quartile;
            qSpan.setAttribute('data-tooltip', 'Mejor cuartil SJR');
            meta.appendChild(qSpan);
        }

        if (citescore) {
            var sSpan = document.createElement('span');
            sSpan.className = 'pub-score';
            sSpan.setAttribute('data-tooltip', 'Scopus CiteScore 2024');
            sSpan.textContent = citescore;
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

    var tabs = document.querySelectorAll('.tab');
    var panels = {};

    // Map tabs to their panels and items
    tabs.forEach(function (tab) {
        var target = tab.getAttribute('data-tab');
        var panel = document.getElementById('panel-' + target);
        if (panel) {
            panels[target] = {
                tab: tab,
                panel: panel,
                sections: panel.querySelectorAll('section'),
                items: []
            };
            var items = panel.querySelectorAll('.scrollable-list li');
            items.forEach(function (li) {
                panels[target].items.push({
                    el: li,
                    text: li.textContent.toLowerCase(),
                    section: li.closest('section')
                });
            });
        }
    });

    var allItems = [];
    var sections = document.querySelectorAll('.tab-panel section');
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
            filterPublications(input.value, allItems, sections, counter, totalCount, panels);
        }, 150);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            input.value = '';
            filterPublications('', allItems, sections, counter, totalCount, panels);
        }
    });
}

function filterPublications(query, allItems, sections, counter, totalCount, panels) {
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

    // Update per-tab match counts
    Object.keys(panels).forEach(function (key) {
        var p = panels[key];
        var countSpan = p.tab.querySelector('.tab-count');
        if (!countSpan) return;

        if (tokens.length === 0) {
            // No search: show total items
            var totalItems = p.panel.querySelectorAll('.scrollable-list li').length +
                             p.panel.querySelectorAll('.project-card').length;
            countSpan.textContent = totalItems;
            countSpan.classList.remove('tab-count-filtered');
        } else {
            // Search active: show matching items
            var matchCount = 0;
            p.items.forEach(function (item) {
                if (!item.el.classList.contains('search-hidden')) {
                    matchCount++;
                }
            });
            countSpan.textContent = matchCount;
            countSpan.classList.toggle('tab-count-filtered', matchCount > 0);
        }
    });

    // Highlight matching text
    highlightMatches(allItems, tokens);

    updateCounter(counter, visibleCount, totalCount);
}

function highlightMatches(allItems, tokens) {
    allItems.forEach(function (item) {
        // Remove previous highlights
        var marks = item.el.querySelectorAll('.search-highlight');
        marks.forEach(function (mark) {
            var parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });

        if (tokens.length === 0 || item.el.classList.contains('search-hidden')) return;

        // Only highlight in text nodes of .pub-citation or direct li children
        var walker = document.createTreeWalker(item.el, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        var node;
        while (node = walker.nextNode()) {
            if (node.parentNode.tagName === 'A' || node.parentNode.classList.contains('pub-meta') ||
                node.parentNode.classList.contains('abstract-content') ||
                node.parentNode.classList.contains('search-highlight')) continue;
            textNodes.push(node);
        }

        textNodes.forEach(function (textNode) {
            var text = textNode.textContent;
            var lowerText = text.toLowerCase();
            var hasMatch = tokens.some(function (t) { return lowerText.indexOf(t) !== -1; });
            if (!hasMatch) return;

            var frag = document.createDocumentFragment();
            var remaining = text;
            var lowerRemaining = remaining.toLowerCase();

            while (remaining.length > 0) {
                var earliest = -1;
                var earliestToken = '';
                tokens.forEach(function (t) {
                    var idx = lowerRemaining.indexOf(t);
                    if (idx !== -1 && (earliest === -1 || idx < earliest)) {
                        earliest = idx;
                        earliestToken = t;
                    }
                });

                if (earliest === -1) {
                    frag.appendChild(document.createTextNode(remaining));
                    break;
                }

                if (earliest > 0) {
                    frag.appendChild(document.createTextNode(remaining.substring(0, earliest)));
                }
                var span = document.createElement('span');
                span.className = 'search-highlight';
                span.textContent = remaining.substring(earliest, earliest + earliestToken.length);
                frag.appendChild(span);

                remaining = remaining.substring(earliest + earliestToken.length);
                lowerRemaining = remaining.toLowerCase();
            }

            textNode.parentNode.replaceChild(frag, textNode);
        });
    });
}

function updateCounter(counter, visible, total) {
    if (!counter) return;
    if (visible === total) {
        counter.textContent = total + ' publicaciones';
    } else {
        counter.textContent = visible + ' de ' + total + ' publicaciones';
    }
}

/* ===== Auto-update date ===== */
function initUpdateDate() {
    var el = document.querySelector('.update-notice');
    if (!el) return;
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var now = new Date();
    var fecha = now.getDate() + ' de ' + meses[now.getMonth()] + ' de ' + now.getFullYear();
    el.textContent = 'Última actualización: ' + fecha + '.';
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

/* ===== Equal Height for Publications ===== */
function initEqualHeight() {
    // Need all panels visible momentarily to measure
    var panels = document.querySelectorAll('.tab-panel');
    panels.forEach(function (p) {
        if (!p.classList.contains('active')) {
            p.style.display = 'block';
            p.style.visibility = 'hidden';
            p.style.position = 'absolute';
        }
    });

    var items = document.querySelectorAll('.scrollable-list li');
    var maxHeight = 0;
    items.forEach(function (li) {
        var h = li.offsetHeight;
        if (h > maxHeight) maxHeight = h;
    });

    // Restore panels
    panels.forEach(function (p) {
        if (!p.classList.contains('active')) {
            p.style.display = '';
            p.style.visibility = '';
            p.style.position = '';
        }
    });

    if (maxHeight > 0) {
        items.forEach(function (li) {
            li.style.minHeight = maxHeight + 'px';
        });
    }
}

/* ===== Back to Top ===== */
function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ===== Citation Count (OpenAlex) ===== */
function initCitations() {
    var scholarLink = document.querySelector('.scholar');
    if (!scholarLink) return;

    fetch('https://api.openalex.org/authors/orcid:0000-0003-4239-1874')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var count = data.cited_by_count;
            if (count) {
                scholarLink.textContent = 'Google Scholar (' + count + ')';
            }
        })
        .catch(function () {});
}

/* ===== Timeline ===== */
function initTimeline() {
    var container = document.getElementById('timeline-container');
    if (!container) return;

    var TYPE_LABELS = {
        'articulos': 'Artículo',
        'otros-articulos': 'Artículo',
        'capitulos': 'Capítulo',
        'documentos': 'Documento',
        'prensa': 'Prensa'
    };

    // Collect all publications from all panels
    var items = [];
    var panels = document.querySelectorAll('.tab-panel');

    panels.forEach(function (panel) {
        var panelId = panel.id.replace('panel-', '');
        var type = TYPE_LABELS[panelId];
        if (!type) return;

        var lis = panel.querySelectorAll('.scrollable-list li');
        lis.forEach(function (li) {
            var yearMatch = li.textContent.match(/\((\d{4})\)/);
            if (!yearMatch) return;
            var year = parseInt(yearMatch[1]);

            // Extract short title
            var text = li.textContent;
            var titleMatch = text.match(/\(\d{4}\)\.\s*([^.]+\.)/);
            var title = titleMatch ? titleMatch[1].trim() : '';
            if (title.length > 80) title = title.substring(0, 77) + '...';

            // Get source
            var emEl = li.querySelector('em');
            var source = emEl ? emEl.textContent : '';

            // Get link
            var linkEl = li.querySelector('a');
            var link = linkEl ? linkEl.href : '';

            items.push({
                year: year,
                type: type,
                title: title,
                source: source,
                link: link
            });
        });
    });

    // Sort by year descending
    items.sort(function (a, b) { return b.year - a.year; });

    // Group by year
    var years = {};
    items.forEach(function (item) {
        if (!years[item.year]) years[item.year] = [];
        years[item.year].push(item);
    });

    // Render
    var sortedYears = Object.keys(years).sort(function (a, b) { return b - a; });
    sortedYears.forEach(function (year) {
        var yearDiv = document.createElement('div');
        yearDiv.className = 'timeline-year';

        var label = document.createElement('div');
        label.className = 'timeline-year-label';
        label.textContent = year;
        yearDiv.appendChild(label);

        var list = document.createElement('div');
        list.className = 'timeline-items';

        years[year].forEach(function (item) {
            var itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item';

            var typeSpan = document.createElement('span');
            typeSpan.className = 'timeline-item-type';
            typeSpan.textContent = item.type;
            itemDiv.appendChild(typeSpan);

            itemDiv.appendChild(document.createTextNode(item.title));

            if (item.source) {
                var sourceEm = document.createElement('em');
                sourceEm.textContent = ' ' + item.source;
                sourceEm.style.color = 'var(--color-text-muted)';
                itemDiv.appendChild(sourceEm);
            }

            if (item.link) {
                var a = document.createElement('a');
                a.href = item.link;
                a.textContent = '→';
                itemDiv.appendChild(a);
            }

            list.appendChild(itemDiv);
        });

        yearDiv.appendChild(list);
        container.appendChild(yearDiv);
    });
}
