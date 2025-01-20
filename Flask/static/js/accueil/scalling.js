// Exécution immédiate pour initialiser les valeurs
(function initializeValues() {
    const defaultValues = {
        'rInput': '1',
        'rOutput': '1',
        'FeedConstant': '10',
        'globalPositionFactor': '0.0001',
        'globalSpeedFactor': '0.001',
        'globalTorqueFactor': '0.003'
    };

    // Initialiser les valeurs dans le localStorage si elles n'existent pas
    Object.entries(defaultValues).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
    });
})();

// Gestion des inputs une fois le DOM chargé
document.addEventListener('DOMContentLoaded', function() {
    ['rInput', 'rOutput', 'FeedConstant'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = localStorage.getItem(id);
            input.addEventListener('input', function() {
                localStorage.setItem(id, this.value);
            });
        }
    });
});