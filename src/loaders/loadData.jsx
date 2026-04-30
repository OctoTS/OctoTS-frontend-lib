/**
 * Prosty parser dla plików rozdzielanych znakami (CSV, TSV)
 */
const parseDelimited = (text, delimiter = ',') => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Obsługa różnych znaków nowej linii (\r\n vs \n)
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/\r/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim().replace(/\r/g, '');
        if (!line) continue;
        
        const values = line.split(delimiter);
        const row = {};
        
        headers.forEach((header, index) => {
            let val = values[index] ? values[index].trim() : null;
            // Próba konwersji na liczbę, jeśli to możliwe
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
 * Parser dla standardowego JSON
 * Oczekuje: [{ "x": 1, "y": 2 }, { "x": 3, "y": 4 }]
 */
const parseJSON = (text) => {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
        throw new Error("Pobrany plik JSON nie jest tablicą obiektów. Biblioteka oczekuje formatu: [{...}, {...}]");
    }
    return parsed;
};

/**
 * Parser dla JSON Lines (JSONL)
 * Oczekuje: 
 * {"x": 1, "y": 2}
 * {"x": 3, "y": 4}
 */
const parseJSONL = (text) => {
    const lines = text.trim().split('\n');
    const data = [];
    
    for (const line of lines) {
        if (!line.trim()) continue;
        data.push(JSON.parse(line));
    }
    return data;
};

/**
 * Helper do wyciągania rozszerzenia z URL lub nazwy pliku
 */
const getExtension = (filename) => {
    // Usuwamy ewentualne parametry URL (np. file.csv?v=1)
    const cleanName = filename.split('?')[0]; 
    const ext = cleanName.split('.').pop().toLowerCase();
    return ext;
};

/**
 * Główna funkcja: Pobieranie danych z URL lub lokalnego pliku
 */
export const loadData = async (source) => {
    let rawText = '';
    let extension = '';

    // 1. POBIERANIE DANYCH
    if (source instanceof File || source instanceof Blob) {
        extension = getExtension(source.name || 'unknown.csv'); // Fallback na csv
        rawText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Wystąpił błąd podczas odczytu pliku.'));
            reader.readAsText(source);
        });
    } else if (typeof source === 'string') {
        extension = getExtension(source);
        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
            rawText = await response.text();
        } catch (error) {
            throw new Error(`Błąd pobierania pliku z URL: ${error.message}`);
        }
    } else {
        throw new Error('Nieobsługiwane źródło. Podaj obiekt pliku (File) lub adres URL (string).');
    }

    // 2. PARSOWANIE NA PODSTAWIE ROZSZERZENIA
    try {
        switch (extension) {
            case 'csv':
                return parseDelimited(rawText, ',');
            case 'tsv':
                return parseDelimited(rawText, '\t');
            case 'json':
                return parseJSON(rawText);
            case 'jsonl':
                return parseJSONL(rawText);
            default:
                console.warn(`Nieznane rozszerzenie: .${extension}. Próba parsowania jako CSV...`);
                return parseDelimited(rawText, ',');
        }
    } catch (error) {
        throw new Error(`Błąd podczas parsowania pliku .${extension}: ${error.message}`);
    }
};