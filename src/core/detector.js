export const guessMapping = (data, columns) => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
        return {};
    }

    const sampleSize = Math.min(data.length, 10);
    const samples = data.slice(0, sampleSize);
    
    const analysis = columns.map(col => {
        let scores = { time: 0, numeric: 0, string: 0 };

        samples.forEach(row => {
            const val = row[col];
            if (val === null || val === undefined) return;

            const isNumeric = typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val));
            const isDate = !isNumeric && !isNaN(Date.parse(val));

            if (isDate) {
                scores.time += 1;
            } else if (isNumeric) {
                scores.numeric += 1;
            } else {
                scores.string += 1;
            }
        });

        return { col, scores };
    });

    const mapping = {};

    const timeCol = analysis.find(a => a.scores.time > sampleSize / 2);
    if (timeCol) mapping.x = timeCol.col;

    const numericCols = analysis.filter(a => a.scores.numeric > sampleSize / 2 && a.col !== mapping.x);
    if (numericCols.length > 0) {
        mapping.y = numericCols[0].col;
        mapping.value = numericCols[0].col;
    }

    const stringCols = analysis.filter(a => a.scores.string > sampleSize / 2);
    if (stringCols.length > 0) {
        mapping.id = stringCols[0].col;
        mapping.group = stringCols[0].col;
    }

    return mapping;
};
