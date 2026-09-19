const SERVICES = {
    atletas: 'http://localhost:3001/atletas',
    resultados: 'http://localhost:3002/resultados',
    rankings: 'http://localhost:3003/rankings/geral'
};

let store = {
    atletas: [],
    resultados: [],
    rankings: [],
    categoriaSelecionada: null
};

let sortConfig = {
    rankings: { col: 'tempo', dir: 'asc' },
    resultados: { col: 'tempo', dir: 'asc' },
    atletas: { col: 'id', dir: 'asc' }
};


function timeToSeconds(t) {
    if (!t || t === '--:--:--' || t === '-') return Infinity;
    const parts = String(t).split(':').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return Infinity;
}


function safeGet(obj, keys, defaultVal = '-') {
    if (!obj) return defaultVal;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }
    return defaultVal;
}

const getNome = item => safeGet(item, ['atleta_nome', 'atletaNome', 'nome', 'nome_atleta']);
const getTempo = item => safeGet(item, ['tempo_prova', 'tempoProva', 'tempo']);
const getStatus = item => safeGet(item, ['status'], 'Finalizou');

function getCatId(item) {
    const val = safeGet(item, ['categoria_id', 'categoriaId', 'categoria', 'id_categoria', 'cat_id', 'categoria_nome']);
    return val !== '-' ? val : 'Geral';
}

function getStatusBadge(status) {
    if (status === 'Finalizou') return `<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded font-medium">Finalizou</span>`;
    if (status === 'DNF') return `<span class="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2 py-0.5 rounded font-medium">DNF</span>`;
    if (status === 'DNS') return `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5 rounded font-medium">DNS</span>`;
    return `<span class="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">${status || '-'}</span>`;
}

window.toggleSort = function(table, col) {
    if (sortConfig[table].col === col) {
        sortConfig[table].dir = sortConfig[table].dir === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig[table].col = col;
        sortConfig[table].dir = 'asc';
    }
    renderAll();
};

function sortData(list, tableKey) {
    const { col, dir } = sortConfig[tableKey];
    const multiplier = dir === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
        let valA, valB;
        if (tableKey === 'rankings') {
            if (col === 'pos' || col === 'tempo') { valA = timeToSeconds(getTempo(a)); valB = timeToSeconds(getTempo(b)); }
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'cat') { valA = getCatId(a); valB = getCatId(b); }
        } else if (tableKey === 'resultados') {
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'tempo') { valA = timeToSeconds(getTempo(a)); valB = timeToSeconds(getTempo(b)); }
            if (col === 'status') { valA = getStatus(a); valB = getStatus(b); }
        } else if (tableKey === 'atletas') {
            if (col === 'id') { valA = parseInt(a.id) || 0; valB = parseInt(b.id) || 0; }
            if (col === 'nome') { valA = getNome(a); valB = getNome(b); }
            if (col === 'cat') { valA = getCatId(a); valB = getCatId(b); }
        }

        if (valA < valB) return -1 * multiplier;
        if (valA > valB) return 1 * multiplier;
        return 0;
    });
}

function renderRankings() {
    const data = sortData(store.rankings, 'rankings');
    const container = document.getElementById('rankings');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum ranking disponível.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'pos')">Pos ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'nome')">Atleta ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('rankings', 'tempo')">Tempo ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('rankings', 'cat')">Cat ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map((r, i) => {
                    const posGeral = i + 1;
                    let posStyle = "text-slate-400";
                    if (posGeral === 1) posStyle = "text-amber-400 font-bold";
                    else if (posGeral === 2) posStyle = "text-slate-300 font-bold";
                    else if (posGeral === 3) posStyle = "text-amber-600 font-bold";

                    return `
                        <tr class="hover:bg-slate-700/30 transition-colors">
                            <td class="p-2 font-mono ${posStyle}">#${posGeral}</td>
                            <td class="p-2 font-medium text-slate-200">${getNome(r)}</td>
                            <td class="p-2 font-mono text-slate-300 text-xs">${getTempo(r)}</td>
                            <td class="p-2 text-right text-xs text-slate-400">Cat #${getCatId(r)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderResultados() {
    const data = sortData(store.resultados, 'resultados');
    const container = document.getElementById('resultados');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum resultado disponível.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('resultados', 'nome')">Atleta ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('resultados', 'tempo')">Tempo ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('resultados', 'status')">Status ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map(res => `
                    <tr class="hover:bg-slate-700/30 transition-colors">
                        <td class="p-2 font-medium text-slate-200">${getNome(res)}</td>
                        <td class="p-2 font-mono text-slate-300 text-xs">${getTempo(res)}</td>
                        <td class="p-2 text-right">${getStatusBadge(getStatus(res))}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAtletas() {
    const data = sortData(store.atletas, 'atletas');
    const container = document.getElementById('atletas');
    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Nenhum atleta cadastrado.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs sticky top-0 uppercase cursor-pointer select-none">
                <tr>
                    <th class="p-2 hover:text-white" onclick="toggleSort('atletas', 'id')">ID ↕</th>
                    <th class="p-2 hover:text-white" onclick="toggleSort('atletas', 'nome')">Nome ↕</th>
                    <th class="p-2 text-right hover:text-white" onclick="toggleSort('atletas', 'cat')">Cat ↕</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${data.map(a => `
                    <tr class="hover:bg-slate-700/30 transition-colors">
                        <td class="p-2 font-mono text-slate-500 text-xs">#${a.id}</td>
                        <td class="p-2 font-medium text-slate-200">${getNome(a)}</td>
                        <td class="p-2 text-right">
                            <span class="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">Cat #${getCatId(a)}</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderRankingPorCategoria() {
    const select = document.getElementById('select-categoria');
    const container = document.getElementById('ranking-categoria-container');


    const categoriasSet = new Set();
    store.atletas.forEach(a => {
        const cat = String(getCatId(a));
        if(cat !== 'Geral' && cat !== '-') categoriasSet.add(cat);
    });
    store.rankings.forEach(r => {
        const cat = String(getCatId(r));
        if(cat !== 'Geral' && cat !== '-') categoriasSet.add(cat);
    });
    const categorias = Array.from(categoriasSet).sort((a,b) => (parseInt(a)||0) - (parseInt(b)||0));


    document.getElementById('kpi-categorias').innerText = categorias.length;

    if (categorias.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-4">Nenhuma categoria encontrada.</p>';
        return;
    }

    if (!store.categoriaSelecionada || !categorias.includes(store.categoriaSelecionada)) {
        store.categoriaSelecionada = categorias[0];
    }

    select.innerHTML = categorias.map(c => `
        <option value="${c}" ${c === store.categoriaSelecionada ? 'selected' : ''}>Categoria #${c}</option>
    `).join('');

    let filtrados = store.rankings.filter(r => String(getCatId(r)) === store.categoriaSelecionada);

    if (filtrados.length === 0) {
        const atletasCat = store.atletas.filter(a => String(getCatId(a)) === store.categoriaSelecionada);
        filtrados = atletasCat.map(a => {
            const res = store.resultados.find(r => getNome(r) === getNome(a) || r.atleta_id == a.id);
            return {
                ...a,
                tempo_prova: res ? getTempo(res) : '--:--:--',
                status: res ? getStatus(res) : 'Inscrito'
            };
        });
    }


    filtrados.sort((a, b) => {
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        if (statusA !== 'Finalizou' && statusB === 'Finalizou') return 1;
        if (statusA === 'Finalizou' && statusB !== 'Finalizou') return -1;
        return timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b));
    });

    const geralOrdenado = [...store.rankings].sort((a,b) => timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b)));

    if (filtrados.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">Sem atletas registrados nesta categoria.</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                    <th class="p-3">Pos. na Categoria</th>
                    <th class="p-3">Atleta</th>
                    <th class="p-3">Tempo</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-right">Pos. Geral</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                ${filtrados.map((item, idx) => {
                    const posCat = idx + 1;
                    const posGeralIndex = geralOrdenado.findIndex(g => getNome(g) === getNome(item));
                    const posGeral = posGeralIndex !== -1 ? posGeralIndex + 1 : '-';

                    let badgeColor = "bg-slate-700 text-slate-300";
                    if (posCat === 1) badgeColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold";
                    else if (posCat === 2) badgeColor = "bg-slate-400/20 text-slate-200 border border-slate-400/30 font-bold";
                    else if (posCat === 3) badgeColor = "bg-amber-700/20 text-amber-500 border border-amber-700/30 font-bold";

                    return `
                        <tr class="hover:bg-slate-700/30 transition-colors">
                            <td class="p-3">
                                <span class="px-2.5 py-1 rounded text-xs ${badgeColor}">
                                    ${posCat}º Lugar
                                </span>
                            </td>
                            <td class="p-3 font-semibold text-slate-100">${getNome(item)}</td>
                            <td class="p-3 font-mono text-xs text-slate-300">${getTempo(item)}</td>
                            <td class="p-3">${getStatusBadge(getStatus(item))}</td>
                            <td class="p-3 text-right font-mono text-slate-400 text-xs">${posGeral !== '-' ? `#${posGeral}` : '-'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

window.onSelectCategoriaChange = function(catId) {
    store.categoriaSelecionada = catId;
    renderRankingPorCategoria();
};

function updateKPIs() {
    document.getElementById('kpi-atletas').innerText = store.atletas.length;

    if (store.resultados && store.resultados.length > 0) {
        const finalizados = store.resultados.filter(r => getStatus(r) === 'Finalizou').length;
        const pct = Math.round((finalizados / store.resultados.length) * 100);
        document.getElementById('kpi-conclusao').innerText = `${pct}%`;
    } else {
        document.getElementById('kpi-conclusao').innerText = '--%';
    }

    const temRankingGeral = store.rankings && store.rankings.length > 0;

    if (temRankingGeral) {
        const rankingOrdenado = [...store.rankings].sort((a,b) => timeToSeconds(getTempo(a)) - timeToSeconds(getTempo(b)));
        const lider = rankingOrdenado[0];

        if (lider && getTempo(lider) !== '--:--:--') {
            document.getElementById('kpi-lider').innerText = getNome(lider);
            document.getElementById('kpi-lider-tempo').innerText = getTempo(lider);
        } else {
            document.getElementById('kpi-lider').innerText = '--';
            document.getElementById('kpi-lider-tempo').innerText = '--:--:--';
        }
    } else {
        document.getElementById('kpi-lider').innerText = 'Indisponível';
        document.getElementById('kpi-lider-tempo').innerText = '--:--:--';
    }
}

function renderAll() {
    renderRankingPorCategoria();
    updateKPIs();
    renderRankings();
    renderResultados();
    renderAtletas();
}

async function fetchAll() {
    try {
        const [resAtletas, resResultados, resRankings] = await Promise.all([
            fetch(SERVICES.atletas).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(SERVICES.resultados).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(SERVICES.rankings).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        store.atletas = Array.isArray(resAtletas) ? resAtletas : [];
        store.resultados = Array.isArray(resResultados) ? resResultados : [];
        store.rankings = Array.isArray(resRankings) ? resRankings : [];

        renderAll();
    } catch (err) {
        console.error("Erro na atualização dos dados:", err);
    }
}

setInterval(fetchAll, 5000);
fetchAll();