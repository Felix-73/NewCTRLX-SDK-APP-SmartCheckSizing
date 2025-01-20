window.addEventListener('load', function() {
    const canvas = document.getElementById('myChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        fetch('/sample-web/api/movement-data')
            .then(response => response.json())
            .then(rawData => {
                if (rawData.success) {
                    const data = {
                        labels: rawData.data.temps,
                        datasets: [
                            {
                                label: 'Position (mm)',
                                data: rawData.data.position.map(val => val * parseFloat(localStorage.getItem('globalPositionFactor'))),
                                borderColor: 'rgb(0,43,73 )',
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

                    const myChart = new Chart(ctx, config);

                    const resetZoom = document.createElement('button');
                    resetZoom.textContent = 'Réinitialiser Zoom';
                    resetZoom.className = 'btn btn-outline-secondary btn-sm';
                    resetZoom.onclick = () => myChart.resetZoom();
                    canvas.parentNode.insertBefore(resetZoom, canvas);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
    }
});