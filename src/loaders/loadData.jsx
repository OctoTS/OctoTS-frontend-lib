/**
 * Prosty parser dla plików tekstowych (CSV, TSV)
 */
const parseDelimited = (text, delimiter = ',') => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/\r/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim().replace(/\r/g, '');
        if (!line) continue;
        const values = line.split(delimiter);
        const row = {};
        headers.forEach((header, index) => {
            let val = values[index] ? values[index].trim() : null;
            if (val !== null && val !== '' && !isNaN(val)) val = Number(val);
            row[header] = val;
        });
        data.push(row);
    }
    return data;
};

const parseJSON = (text) => JSON.parse(text);

const parseJSONL = (text) => text.trim().split('\n').filter(l => l.trim()).map(JSON.parse);

/**
 * ==========================================
 * PARSERY BINARNE / ZEWNĘTRZNE BUNDLE
 * ==========================================
 */

// EXCEL (.xlsx, .xls) -> Wykorzystuje SheetJS
const parseExcel = async (arrayBuffer) => {
    // Ładujemy potężnego SheetJS dynamicznie
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    // Pobieramy pierwszy arkusz
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // Konwertujemy do tablicy obiektów
    return XLSX.utils.sheet_to_json(worksheet);
};

// SQLITE (.db, .sqlite) -> Wykorzystuje sql.js (WASM)
const parseSQLite = async (arrayBuffer) => {
    // Inicjalizacja WASM
    const initSqlJsModule = await import('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js');
    const initSqlJs = initSqlJsModule.default;
    const SQL = await initSqlJs({
        // Musimy wskazać, skąd dociągnąć plik .wasm
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    const db = new SQL.Database(new Uint8Array(arrayBuffer));
    
    // Szukamy pierwszej tabeli użytkownika w bazie
    const tableQuery = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' LIMIT 1;");
    if (tableQuery.length === 0) throw new Error("Brak tabel w pliku SQLite.");
    
    const tableName = tableQuery[0].values[0][0];
    
    // Pobieramy wszystko z pierwszej tabeli
    const result = db.exec(`SELECT * FROM "${tableName}";`);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    
    // Mapowanie wyników na tablicę obiektów
    return values.map(row => {
        let obj = {};
        columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj;
    });
};

// PARQUET (.parquet) -> Wykorzystuje parquet-wasm
const parseParquet = async (arrayBuffer) => {
    // Używamy zaktualizowanych ścieżek z jsDelivr dla wersji 0.6.1
    const parquetWasm = await import('https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm.js');
    await parquetWasm.default('https://cdn.jsdelivr.net/npm/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm');
    
    // Dekodujemy Parquet do formatu Apache Arrow
    const wasmTable = parquetWasm.readParquet(new Uint8Array(arrayBuffer));
    
    // Arrow JS do przetłumaczenia tabeli z pamięci binarnej do czystej tablicy obiektów
    const arrow = await import('https://cdn.jsdelivr.net/npm/apache-arrow@16.0.0/+esm');
    const table = arrow.tableFromIPC(wasmTable.intoIPCStream());
    return table.toArray().map(row => row.toJSON());
};

// FEATHER / ARROW (.feather, .arrow) -> Wykorzystuje apache-arrow
const parseFeather = async (arrayBuffer) => {
    try {
        const arrow = await import('https://cdn.jsdelivr.net/npm/apache-arrow@16.0.0/+esm');
        const table = arrow.tableFromIPC(new Uint8Array(arrayBuffer));
        return table.toArray().map(row => row.toJSON());
    } catch (error) {
        // Przechwytujemy specyficzny błąd o braku kompresji
        if (error.message && error.message.includes("compression not implemented")) {
            throw new Error(
                "Plik Feather/Arrow jest skompresowany (np. LZ4/ZSTD), czego przeglądarka nie obsługuje natywnie. " +
                "Zapisz plik bez kompresji (w Pythonie: df.to_feather('plik.feather', compression='uncompressed'))."
            );
        }
        // Jeśli to inny błąd, rzucamy go dalej
        throw error;
    }
};

const getExtension = (filename) => filename.split('?')[0].split('.').pop().toLowerCase();

/**
 * Główna funkcja: Pobieranie danych (z URL lub Pliku)
 */
export const loadData = async (source) => {
    let extension = '';
    let arrayBuffer = null;

    // 1. POBIERANIE DANYCH JAKO RAW BYTES (ArrayBuffer)
    if (source instanceof File || source instanceof Blob) {
        extension = getExtension(source.name || 'unknown.csv');
        arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
            reader.readAsArrayBuffer(source); // Czytamy jako bajty!
        });
    } else if (typeof source === 'string') {
        extension = getExtension(source);
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        arrayBuffer = await response.arrayBuffer(); // Czytamy jako bajty!
    } else {
        throw new Error('Nieobsługiwane źródło.');
    }

    // Decoder tekstowy dla formatów starszych (CSV, JSON)
    const textDecoder = new TextDecoder('utf-8');
    
    // Zmienna przechowująca wynik parsowania przed dodaniem metadanych
    let parsedData = [];

    // 2. PARSOWANIE
    try {
        switch (extension) {
            case 'csv': 
                parsedData = parseDelimited(textDecoder.decode(arrayBuffer), ','); 
                break;
            case 'tsv': 
                parsedData = parseDelimited(textDecoder.decode(arrayBuffer), '\t'); 
                break;
            case 'json': 
                parsedData = parseJSON(textDecoder.decode(arrayBuffer)); 
                break;
            case 'jsonl': 
                parsedData = parseJSONL(textDecoder.decode(arrayBuffer)); 
                break;
            case 'xlsx': 
            case 'xls': 
                parsedData = await parseExcel(arrayBuffer); 
                break;
            case 'sqlite':
            case 'db': 
                parsedData = await parseSQLite(arrayBuffer); 
                break;
            case 'parquet': 
                parsedData = await parseParquet(arrayBuffer); 
                break;
            case 'feather':
            case 'arrow': 
                parsedData = await parseFeather(arrayBuffer); 
                break;
            default:
                console.warn(`Nieznane rozszerzenie: .${extension}. Próba parsowania jako CSV...`);
                parsedData = parseDelimited(textDecoder.decode(arrayBuffer), ',');
                break;
        }
    } catch (error) {
        throw new Error(`Błąd podczas parsowania pliku .${extension}: ${error.message}`);
    }

    // 3. WYCIĄGANIE KOLUMN I ZWRACANIE OBIEKTU W STYLU PYTHONOWYM
    if (!parsedData || parsedData.length === 0) {
        return { data: [], columns: [] };
    }

    // Wyciągamy klucze z pierwszego wiersza (nagłówki)
    const columns = Object.keys(parsedData[0]);

    // Zwracamy obiekt z danymi i nagłówkami
    return {
        data: parsedData,
        columns: columns
    };
};