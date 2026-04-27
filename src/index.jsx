import { makeplot } from './core/makeplot.jsx';
import { loadData } from './loaders/loadData.jsx';

// Eksportujemy do użycia jako moduł ES (jeśli importujesz to w innym projekcie JS/TS)
export { makeplot, loadData };

// Dodajemy do obiektu window dla globalnego użycia (np. w tagu <script> w starym HTML)
if (typeof window !== 'undefined') {
    window.makeplot = makeplot;
    window.loadData = loadData;
}