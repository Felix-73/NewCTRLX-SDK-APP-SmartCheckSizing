     // Attendre que le DOM soit complètement chargé
     window.addEventListener('load', function() {
        // Vérifier si l'élément existe
        const canvas = document.getElementById('myChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Création de données aléatoires
            const data = {
                labels: Array.from({length: 50}, (_, i) => i),
                datasets: [{
                    label: 'Données exemple',
                    data: Array.from({length: 50}, () => Math.random() * 100),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };

            const config = {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy'
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'xy',
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Index'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Valeur'
                            }
                        }
                    }
                }
            };

            // Créer le graphique
            const myChart = new Chart(ctx, config);
        }
    });