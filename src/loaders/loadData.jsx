/**
 * Prosty parser CSV do JSON (tablica obiektów)
 */
const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            let val = values[index] ? values[index].trim() : null;
            if (val !== null && val !== '' && !isNaN(val)) {
                val = Number(val);
            }
            row[header] = val;
        });
        
        data.push(row);
    }
    return data;
};

/**
 * Pobieranie danych z URL lub lokalnego pliku
 */
export const loadData = async (source) => {
    let csvText = '';

    if (source instanceof File || source instanceof Blob) {
        csvText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Wystąpił błąd podczas odczytu pliku.'));
            reader.readAsText(source);
        });
    } else if (typeof source === 'string') {
        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
            csvText = await response.text();
        } catch (error) {
            throw new Error(`Błąd pobierania pliku z URL: ${error.message}`);
        }
    } else {
        throw new Error('Nieobsługiwane źródło. Podaj obiekt pliku (File) lub adres URL (string).');
    }

    return parseCSV(csvText);
};