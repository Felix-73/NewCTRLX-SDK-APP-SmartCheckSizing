/****************************
 * GESTIONNAIRE DE DONNÉES  *
 ****************************/
const DataManager = {
    STORAGE_KEYS: {
        DRIVES_DATA: 'drivesData',
        FETCH_TIME: 'drivesFetchTime',
        LAST_SELECTION: 'lastSelectedDrive',
        LAST_MODE: 'lastMode',
        LAST_DEMO: 'lastDemoSelection',
        CHART_DATA: 'chartData',
    },
    CACHE_DURATION: 5000,
    currentMode: null,
    selectedDrive: null,
    selectedDemo: null,
    currentDrives: null,

    getDataUrl() {
        if (this.currentMode === 'demo') {
            return `/sample-web/api/movement-data-exemples/${this.selectedDemo}`;
        }
        return this.selectedDrive 
            ? `/sample-web/api/movement-data`
            : '/sample-web/api/movement-data';
    },

    setMode(mode, selection) {
        this.currentMode = mode;
        if (mode === 'demo') {
            this.selectedDemo = selection;
            this.selectedDrive = null;
        } else {
            this.selectedDrive = selection;
            this.selectedDemo = null;
        }
        localStorage.setItem(this.STORAGE_KEYS.LAST_MODE, mode);
        localStorage.setItem(
            mode === 'demo' ? this.STORAGE_KEYS.LAST_DEMO : this.STORAGE_KEYS.LAST_SELECTION,
            selection
        );
    },

    async getDrivesData() {
        const cachedData = localStorage.getItem(this.STORAGE_KEYS.DRIVES_DATA);
        const lastFetch = localStorage.getItem(this.STORAGE_KEYS.FETCH_TIME);
        const now = Date.now();

        if (cachedData && lastFetch && (now - lastFetch < this.CACHE_DURATION)) {
            return JSON.parse(cachedData);
        }

        const response = await fetch('/sample-web/api/drives');
        const data = await response.json();

        if (data.success) {
            localStorage.setItem(this.STORAGE_KEYS.DRIVES_DATA, JSON.stringify(data));
            localStorage.setItem(this.STORAGE_KEYS.FETCH_TIME, now.toString());
        }

        return data;
    },

    async updateDrive(value) {
        if (!value) return;
        try {
            const response = await fetch(`/sample-web/api/drives/${value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem(this.STORAGE_KEYS.LAST_SELECTION, value);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
};

/*****************************
 * GESTIONNAIRE DU GRAPHIQUE *
 *****************************/
const ChartManager = {
    chart: null,
    canvas: null,

    storeChartData(rawData) {
        try {
            localStorage.setItem(DataManager.STORAGE_KEYS.CHART_DATA, JSON.stringify(rawData));
            localStorage.setItem(DataManager.STORAGE_KEYS.CHART_DATA_TIME, Date.now().toString());
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage plein, impossible de stocker les données');
            } else {
                console.error('Erreur lors du stockage des données:', error);
            }
        }
    },
    
    getStoredChartData() {
        try {
            const data = localStorage.getItem(DataManager.STORAGE_KEYS.CHART_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null;
        }
    },

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas non trouvé');
            return;
        }
        this.addResetZoomButton();
    },

    async updateChart(url) {
        try {
            const response = await fetch(url);
            const rawData = await response.json();
            
            if (rawData.success) {
                this.destroyChart();
                this.createChart(rawData);
                this.storeChartData(rawData);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            // Tentative de récupération des données stockées
            const storedData = this.getStoredChartData();
            if (storedData) {
                this.destroyChart();
                this.createChart(storedData);
            }
        }
    },

    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
        }
    },

    createChart(rawData) {
        const ctx = this.canvas.getContext('2d');
        const data = {
            labels: rawData.data.temps,
            datasets: [
                {
                    label: 'Position (mm)',
                    data: rawData.data.position.map(val => val * parseFloat(localStorage.getItem('globalPositionFactor'))),
                    borderColor: 'rgb(0,43,73)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'Couple (Nm)',
                    data: rawData.data.couple.map(val => val * parseFloat(localStorage.getItem('globalTorqueFactor'))),
                    borderColor: 'rgb(90,124,145)',
                    borderWidth: 0.5,
                    tension: 0.1,
                    pointRadius: 0,
                    yAxisID: 'y1'
                },
                {
                    label: 'Vitesse (mm/s)',
                    data: rawData.data.vitesse.map(val => val * parseFloat(localStorage.getItem('globalSpeedFactor'))),
                    borderColor: 'rgb(0,204,255)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 0,
                    yAxisID: 'y2'
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                animation: {
                    duration: 400,
                },
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        cornerRadius: 6
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            modifierKey: 'ctrl',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy',
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Temps (ms)',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Position (mm)',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Couple (Nm)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Vitesse (mm/s)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        };

        this.chart = new Chart(ctx, config);
    },

    addResetZoomButton() {
        const resetZoomButton = document.getElementById('resetZoom');
        if (resetZoomButton) {
            resetZoomButton.onclick = () => this.chart.resetZoom();
        }
    }
};

/********************************
 * GESTIONNAIRE DE L'INTERFACE  *
 ********************************/
const UIManager = {
    init() {
        const driveSelect = document.getElementById('drivesSelect');
        const demoSelect = document.getElementById('exemple-select');

        if (!driveSelect || !demoSelect) {
            console.error('Éléments de sélection non trouvés');
            return;
        }

        driveSelect.addEventListener('change', async (e) => {
            if (e.target.value) {
                DataManager.setMode('normal', e.target.value);
                demoSelect.value = '';
                await DataManager.updateDrive(e.target.value);
                this.updateChartDisplay();
            }
        });

        demoSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                DataManager.setMode('demo', e.target.value);
                driveSelect.value = '';
                this.updateChartDisplay();
            }
        });

        this.loadDrives();
        this.restoreLastSelection();
    },

    async loadDrives() {
        try {
            const data = await DataManager.getDrivesData();
            if (data && data.success) {
                DataManager.currentDrives = data;
                this.displayDrives(data);
                
                // Restaurer la sélection si en mode normal
                if (DataManager.currentMode === 'normal') {
                    const lastDrive = localStorage.getItem(DataManager.STORAGE_KEYS.LAST_SELECTION);
                    if (lastDrive) {
                        const driveSelect = document.getElementById('drivesSelect');
                        driveSelect.value = lastDrive;
                    }
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    },

    displayDrives(data) {
        const select = document.getElementById('drivesSelect');
        select.innerHTML = '<option value="">Sélectionnez un drive...</option>';

        if (!data.data) return;

        const drives = Array.isArray(data.data) ? data.data : [data.data];
        drives.forEach(drive => {
            const option = document.createElement('option');
            option.value = drive;
            option.textContent = drive;
            select.appendChild(option);
        });
    },

    async updateChartDisplay() {
        const url = DataManager.getDataUrl();
        await ChartManager.updateChart(url);
    },

    restoreLastSelection() {
        const lastMode = localStorage.getItem(DataManager.STORAGE_KEYS.LAST_MODE);
        const demoSelect = document.getElementById('exemple-select');
        const driveSelect = document.getElementById('drivesSelect');

        // Réinitialiser les deux sélections d'abord
        demoSelect.value = '';
        driveSelect.value = '';

        if (lastMode === 'demo') {
            const lastDemo = localStorage.getItem(DataManager.STORAGE_KEYS.LAST_DEMO);
            if (lastDemo) {
                demoSelect.value = lastDemo;
                DataManager.setMode('demo', lastDemo);
            }
        } else if (lastMode === 'normal') {
            const lastDrive = localStorage.getItem(DataManager.STORAGE_KEYS.LAST_SELECTION);
            if (lastDrive) {
                driveSelect.value = lastDrive;
                DataManager.setMode('normal', lastDrive);
            }
        }

        // Si aucun mode n'est défini, on réinitialise tout
        if (!lastMode) {
            localStorage.removeItem(DataManager.STORAGE_KEYS.LAST_DEMO);
            localStorage.removeItem(DataManager.STORAGE_KEYS.LAST_SELECTION);
            localStorage.removeItem(DataManager.STORAGE_KEYS.LAST_MODE);
        }

        this.updateChartDisplay();
    },

    showError(message) {
        const statusDiv = document.getElementById('statusMessage');
        if (statusDiv) {
            statusDiv.innerHTML = `<p class="error-message">Erreur: ${message}</p>`;
        }
    },

    showSuccess(message) {
        const statusDiv = document.getElementById('statusMessage');
        if (statusDiv) {
            statusDiv.innerHTML = `<p class="status-message success">${message}</p>`;
        }
    },

    showStatus(message) {
        const statusDiv = document.getElementById('statusMessage');
        if (statusDiv) {
            statusDiv.innerHTML = `<p class="status-message">${message}</p>`;
        }
    }
};

/*******************
 * INITIALISATION  *
 *******************/
document.addEventListener('DOMContentLoaded', () => {
    ChartManager.init('myChart');
    UIManager.init();

    // Rafraîchissement périodique des drives
    setInterval(async () => {
        const newData = await DataManager.getDrivesData();
        if (newData && newData.success && 
            JSON.stringify(newData) !== JSON.stringify(DataManager.currentDrives)) {
            DataManager.currentDrives = newData;
            UIManager.displayDrives(newData);
        }
    }, DataManager.CACHE_DURATION);
});