let currentChart = null;
let cachedMoteurData = new Map(); // Cache pour les données moteur

document.addEventListener('DOMContentLoaded', async function() {
    const canvas = document.getElementById('myChart');
    const select = document.getElementById('Indrasize-Select');
    if (!canvas || !select) return;

    const motorDataBasePath = select.dataset.basePath;
    const lastSelectedMotor = localStorage.getItem('lastSelectedMotor');
    if (lastSelectedMotor) select.value = lastSelectedMotor;

    // Memoization pour calculateStats
    const memoizedCalculateStats = (() => {
        const cache = new Map();
        return (array) => {
            const key = array.join(',');
            if (cache.has(key)) return cache.get(key);
            const result = {
                mean: array.length > 0 ? array.reduce((acc, val) => acc + Math.abs(val), 0) / array.length : null,
                rms: array.length > 0 ? Math.sqrt(array.reduce((acc, val) => acc + Math.pow(Math.abs(val), 2), 0) / array.length) : null
            };
            cache.set(key, result);
            return result;
        };
    })();

    // Optimisation getMaxPoints avec Set pour une recherche plus rapide
    const getMaxPoints = (couples, vitesses, limit = 100) => {
        const indices = new Set();
        const result = couples
            .map((valeur, index) => ({ index, valeur: Math.abs(valeur) }))
            .sort((a, b) => b.valeur - a.valeur)
            .slice(0, limit);
        
        result.forEach(item => indices.add(item.index));
        
        return result.map(item => ({
            x: Math.abs(vitesses[item.index]),
            y: item.valeur
        }));
    };

    // Fetch avec cache et timeout
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

    const createChartConfig = (vitesseMoyenne, rms, maxPoints, moteurData) => ({
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Point de fonctionnement',
                    data: [{ x: vitesseMoyenne, y: rms }],
                    backgroundColor: '#002B49',
                    pointRadius: 8,
                },
                {
                    label: 'Points intermittents',
                    data: maxPoints,
                    backgroundColor: '#00CCFF',
                    pointRadius: 3,
                },
                ...(moteurData ? [
                    {
                        label: 'Courbe max rms',
                        data: moteurData.map(point => ({
                            x: point.n,
                            y: point.Mcont_result
                        })),
                        backgroundColor: '#002B49',
                        borderColor: '#002B49',
                        showLine: true,
                        pointRadius: 0,
                    },                    {
                        label: 'Courbe max point intermittents',
                        data: moteurData.map(point => ({
                            x: point.n,
                            y: point.Mmax_result
                        })),
                        backgroundColor: '#00CCFF',
                        borderColor: '#00CCFF',
                        showLine: true,
                        pointRadius: 0,
                    }
                ] : [])
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 400 
            },
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
                        text: 'Vitesse (mm/s)',
                        font: { weight: 'bold' }
                    }
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

    async function updateChart(selectedMoteur = null) {
        try {
            // Utilisation du cache pour les données moteur
            let moteurData = null;
            if (selectedMoteur) {
                if (cachedMoteurData.has(selectedMoteur)) {
                    moteurData = cachedMoteurData.get(selectedMoteur);
                } else {
                    moteurData = await fetchData(`${motorDataBasePath}${selectedMoteur}.json`);
                    if (moteurData) cachedMoteurData.set(selectedMoteur, moteurData);
                }
            }

            const lastMode = localStorage.getItem('lastMode');
            const lastDemo = localStorage.getItem('lastDemoSelection');
            const movementData = await fetchData(lastMode === 'demo' ? 
                `/smart-check-sizing/api/movement-data-exemples/${lastDemo}` : 
                `/smart-check-sizing/api/movement-data`);

            if (!movementData || !movementData.success) throw new Error('Données de mouvement non valides');

            const factors = {
                position: parseFloat(localStorage.getItem('globalPositionFactor')) || 1,
                torque: parseFloat(localStorage.getItem('globalTorqueFactor')) || 1,
                speed: parseFloat(localStorage.getItem('globalSpeedFactor')) || 1
            };

            // Traitement des données optimisé avec TypedArrays pour de meilleures performances
            const array_Position = new Float32Array(movementData.data.position.map(val => val * factors.position));
            const array_Couple = new Float32Array(movementData.data.couple.map(val => val * factors.torque));
            const array_Vitesse = new Float32Array(movementData.data.vitesse.map(val => val * factors.speed));

            const { mean: vitesseMoyenne } = memoizedCalculateStats(Array.from(array_Vitesse));
            const { rms } = memoizedCalculateStats(Array.from(array_Couple));
            const maxPoints = getMaxPoints(Array.from(array_Couple), Array.from(array_Vitesse));

            if (currentChart) currentChart.destroy();
            const ctx = canvas.getContext('2d');
            currentChart = new Chart(ctx, createChartConfig(vitesseMoyenne, rms, maxPoints, moteurData));

            // Mise à jour des variables globales de manière optimisée
            Object.assign(window, {
                globalVitesseMoyenne: vitesseMoyenne,
                globalRms: rms,
                globalArrayXCouplePointMax: maxPoints.map(p => p.x),
                globalArrayYCouplePointMax: maxPoints.map(p => p.y)
            });
        } catch (error) {
            console.error('Erreur lors du traitement des données:', error);
        }
    }

    document.getElementById('resetZoom').addEventListener('click', () => {
        if (currentChart) {
            currentChart.resetZoom();
        }
    });
    // Initialisation et gestion des événements
    await updateChart(lastSelectedMotor);
    
    select.addEventListener('change', async (e) => {
        const selectedMotor = e.target.value;
        localStorage.setItem('lastSelectedMotor', selectedMotor);
        await updateChart(selectedMotor);
    });
});