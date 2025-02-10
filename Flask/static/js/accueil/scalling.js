(function initializeValues() {
    const defaultValues = {
        'rInput': '1',
        'rOutput': '1',
        'FeedConstant': '10',
        'globalPositionFactor': '0.0001',
        'globalSpeedFactor': '0.001',
        'globalTorqueFactor': '0.003'
    };

    Object.entries(defaultValues).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
    });
})();


document.addEventListener('DOMContentLoaded', function() {
    const globalFactors = ['globalPositionFactor', 'globalSpeedFactor', 'globalTorqueFactor'];
    
    globalFactors.forEach(factorId => {
        const input = document.getElementById(factorId);
        if (input) {
            input.value = localStorage.getItem(factorId);
            
            input.addEventListener('input', function() {
                const formattedValue = parseFloat(this.value).toFixed(4);
                localStorage.setItem(factorId, formattedValue);
                this.value = formattedValue;
            });
        }
    });
});