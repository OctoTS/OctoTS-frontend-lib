/**
 * Plik: src/transformers/nivo.js
 * * @param {string} type - Typ wykresu (np. 'line', 'pie', 'bar')
 * @param {Array} data - Płaskie dane z CSV (tablica obiektów)
 * @param {Object} mapping - Obiekt wskazujący, z których kolumn korzystać
 */
export const transformNivoData = (type, data, mapping = {}) => {
    if (!data || data.length === 0) return [];

    switch (type?.toLowerCase()) {
        case 'line':
        case 'bump':
            // Nivo Line/Bump wymaga: [{ id: 'NazwaSerii', data: [{ x, y }] }]
            if (!mapping.x || !mapping.y) {
                console.warn("Nivo Line wymaga 'mapping.x' i 'mapping.y'. Zwracam surowe dane.");
                return data;
            }
            
            // Jeśli w CSV mamy kolumnę definiującą serie (np. Miasto)
            if (mapping.series) {
                const grouped = data.reduce((acc, row) => {
                    const seriesName = row[mapping.series] || 'Inne';
                    if (!acc[seriesName]) acc[seriesName] = [];
                    acc[seriesName].push({ x: row[mapping.x], y: row[mapping.y] });
                    return acc;
                }, {});

                return Object.keys(grouped).map(key => ({
                    id: String(key),
                    data: grouped[key]
                }));
            } 
            // Brak podziału na serie - jedna wielka linia
            else {
                return [{
                    id: mapping.y, // Nazwa serii bierze się z nazwy kolumny Y
                    data: data.map(row => ({ x: row[mapping.x], y: row[mapping.y] }))
                }];
            }

        case 'pie':
            // Nivo Pie wymaga: [{ id: 'Etykieta', value: Wartosc }]
            if (!mapping.id || !mapping.value) {
                console.warn("Nivo Pie wymaga 'mapping.id' i 'mapping.value'. Zwracam surowe dane.");
                return data;
            }
            return data.map(row => ({
                id: String(row[mapping.id]),
                label: String(row[mapping.id]),
                value: Number(row[mapping.value]) || 0
            }));

        case 'bar':
            // Nivo Bar zazwyczaj radzi sobie z płaskimi danymi bezpośrednio,
            // kluczem są opcje (keys, indexBy), które definiujesz w `options`.
            // Możemy więc zwrócić je as is, lub przeprowadzić delikatne czyszczenie.
            return data;

        default:
            // Dla nieobsłużonych jeszcze wykresów zwracamy oryginał
            return data;
    }
};