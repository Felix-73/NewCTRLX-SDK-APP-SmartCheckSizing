// Constants
const CACHE_DURATION = 5000;
const STORAGE_KEYS = {
    DRIVES_DATA: 'drivesData',
    FETCH_TIME: 'drivesFetchTime',
    LAST_SELECTION: 'lastSelectedDrive'
};

// État global
let currentDrives = null;

// Fonction principale de chargement
async function loadDrives() {
    try {
        const data = await getDrivesData();
        if (data && data.success) {
            currentDrives = data;
            displayDrives(data);
        }
    } catch (error) {
        showError(error.message);
    }
}

// Récupération des données avec gestion du cache
async function getDrivesData() {
    const cachedData = localStorage.getItem(STORAGE_KEYS.DRIVES_DATA);
    const lastFetch = localStorage.getItem(STORAGE_KEYS.FETCH_TIME);
    const now = Date.now();

    if (cachedData && lastFetch && (now - lastFetch < CACHE_DURATION)) {
        return JSON.parse(cachedData);
    }

    const response = await fetch('/sample-web/api/drives');
    const data = await response.json();

    if (data.success) {
        localStorage.setItem(STORAGE_KEYS.DRIVES_DATA, JSON.stringify(data));
        localStorage.setItem(STORAGE_KEYS.FETCH_TIME, now.toString());
    }

    return data;
}

// Affichage des drives
function displayDrives(data) {
    const select = document.getElementById('drivesSelect');
    const lastSelected = localStorage.getItem(STORAGE_KEYS.LAST_SELECTION);
    
    select.innerHTML = '<option value="">Sélectionnez un drive...</option>';

    if (!data.data) return;

    const drives = Array.isArray(data.data) ? data.data : [data.data];
    
    drives.forEach(drive => {
        const option = document.createElement('option');
        option.value = drive;
        option.textContent = drive;
        option.selected = drive === lastSelected;
        select.appendChild(option);
    });
}

// Mise à jour du drive
async function updateDrive(value) {
    if (!value) return;

    const statusDiv = document.getElementById('statusMessage');
    statusDiv.innerHTML = '<p class="status-message">Mise à jour en cours...</p>';

    try {
        const response = await fetch(`/sample-web/api/drives/${value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem(STORAGE_KEYS.LAST_SELECTION, value);
            showSuccess(`Drive mis à jour avec succès : ${value}`);
        } else {
            showError(data.error || 'Erreur inconnue');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Fonctions utilitaires pour l'affichage des messages
function showError(message) {
    document.getElementById('statusMessage').innerHTML = 
        `<p class="error-message">Erreur: ${message}</p>`;
}

function showSuccess(message) {
    document.getElementById('statusMessage').innerHTML = 
        `<p class="status-message success">${message}</p>`;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadDrives();
    
    // Rafraîchissement périodique
    setInterval(async () => {
        const newData = await getDrivesData();
        if (newData && newData.success && 
            JSON.stringify(newData) !== JSON.stringify(currentDrives)) {
            currentDrives = newData;
            displayDrives(newData);
        }
    }, CACHE_DURATION);
});


