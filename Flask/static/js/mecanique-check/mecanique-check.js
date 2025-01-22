document.addEventListener('DOMContentLoaded', async function() {
    Chart.register(ChartZoom);
    const canvas = document.getElementById('myChart');
    if (!canvas) return;

    let referenceData = JSON.parse(localStorage.getItem('referenceData')); // Charge la référence sauvegardée
    let currentChart = null;

    async function fetchData(url, timeout = 5000) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            if ('success' in data && !data.success) throw new Error('Échec de la récupération des données');
            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des données depuis ${url}:`, error);
            return null;
        }
    }

    async function getData() {
        try {
            const lastMode = localStorage.getItem('lastMode');
            const lastDemo = localStorage.getItem('lastDemoSelection');
            
            const movementData = await fetchData(lastMode === 'demo' ? 
                `/sample-web/api/movement-data-exemples/${lastDemo}` : 
                `/sample-web/api/movement-data`);

            if (!movementData || !movementData.success) throw new Error('Données de mouvement non valides');

            const factors = {
                position: parseFloat(localStorage.getItem('globalPositionFactor')) || 1,
                torque: parseFloat(localStorage.getItem('globalTorqueFactor')) || 1,
                speed: parseFloat(localStorage.getItem('globalSpeedFactor')) || 1
            };

            return {
                position: movementData.data.position.map(val => val * factors.position),
                couple: movementData.data.couple.map(val => val * factors.torque),
                vitesse: movementData.data.vitesse.map(val => val * factors.speed)
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null;
        }
    }

    function createChart(data) {
        if (currentChart) {
            currentChart.destroy();
        }

        const datasets = [{
            label: 'Courbe actuelle',
            data: data.couple.map((couple, index) => ({
                x: data.position[index],
                y: couple
            })),
            borderColor: '#002B49',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0
        }];

        // Ajoute la courbe de référence si elle existe
        if (referenceData) {
            datasets.push({
                label: 'Courbe de référence',
                data: referenceData.couple.map((couple, index) => ({
                    x: referenceData.position[index],
                    y: couple
                })),
                borderColor: '#A3BAC8	',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0
            });
        }
        currentChart = new Chart(canvas, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                animation: { duration: 400 },
                devicePixelRatio: 1,
                plugins: {
                    legend: { position: 'top' },
                    zoom: {
                        pan: { enabled: true, mode: 'xy' },
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy',
                            drag: { enabled: true },
                            dragData: false,
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Position (mm)',
                            font: { weight: 'bold' }
                        },
                        max: 200, // Force la valeur maximale à 200
                        beginAtZero: true
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Couple (Nm)',
                            font: { weight: 'bold' }
                        }
                    }
                }
            }
        });

        return currentChart;
    }

    document.getElementById('resetZoom').addEventListener('click', () => {
        if (currentChart) {
            currentChart.resetZoom();
        }
    });

    document.getElementById('saveReference').addEventListener('click', async () => {
        const currentData = await getData();
        if (currentData) {
            referenceData = {...currentData};
            localStorage.setItem('referenceData', JSON.stringify(referenceData)); // Sauvegarde dans localStorage
            createChart(currentData);
        }
    });

    document.getElementById('clearReference').addEventListener('click', async () => {
        referenceData = null;
        localStorage.removeItem('referenceData'); // Supprime du localStorage
        const currentData = await getData();
        if (currentData) {
            createChart(currentData);
        }
    });

    // Initial chart creation
    const initialData = await getData();
    if (initialData) {
        createChart(initialData);
    }
});