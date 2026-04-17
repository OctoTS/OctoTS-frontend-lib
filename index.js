// src/octo-vanilla.js
import Chart from 'chart.js/auto';
import * as echarts from 'echarts';

/**
 * Zaktualizowana funkcja OctoTS
 * @param {string} engine - 'chartjs' lub 'echarts'
 * @param {string} containerId - ID elementu HTML
 * @param {Object} config - Obiekt z ustawieniami i danymi
 */
export function makewykres(engine, containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`OctoTS: Nie znaleziono elementu: ${containerId}`);
    return;
  }

  if (!container.style.height) container.style.height = '400px';

  // Wypakowujemy dane z obiektu konfiguracyjnego z wartościami domyślnymi
  const {
    type = 'bar',
    title = '',
    subtitle = '',      // NOWE: np. Timestamp wyświetlany nad wykresem
    xAxisTitle = '',    // NOWE: np. ogólny podpis osi "Miasto"
    yAxisTitle = '',    // np. "Temperatura (°C)"
    labels = [],        // np. ["Warszawa", "Kraków", "Wrocław"] (podpisy pod słupkami)
    data = []           // np. [15, 18, 16] (wielkość słupków)
  } = config;

  // --- OBSŁUGA CHART.JS ---
  if (engine === 'chartjs') {
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    
    return new Chart(canvas, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: yAxisTitle || 'Wartość',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          title: { display: !!title, text: title, font: { size: 16 } },
          // Dodajemy obsługę podtytułu (np. dla Timestampa)
          subtitle: { display: !!subtitle, text: subtitle, font: { size: 12, color: 'gray' }, padding: { bottom: 10 } }
        },
        scales: {
          x: { title: { display: !!xAxisTitle, text: xAxisTitle } },
          y: { title: { display: !!yAxisTitle, text: yAxisTitle } }
        }
      }
    });
  }

  // --- OBSŁUGA ECHARTS ---
  if (engine === 'echarts') {
    container.innerHTML = ''; 
    const myChart = echarts.init(container);
    
    const option = {
      title: { 
        text: title, 
        subtext: subtitle, // ECharts ma wbudowane pole subtext, idealne na Timestamp
        left: 'center' 
      },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: labels,
        name: xAxisTitle,
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: { 
        type: 'value',
        name: yAxisTitle
      },
      series: [{
        data: data,
        type: type,
        smooth: true
      }]
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
    return myChart;
  }
}