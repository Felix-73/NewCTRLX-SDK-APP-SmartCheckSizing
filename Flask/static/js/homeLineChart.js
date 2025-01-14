document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
                label: 'Performance 2023',
                data: [65, 70, 75, 72, 80, 85, 88, 87, 84, 90, 92, 95],
                borderColor: '#00CCFF',
                backgroundColor: 'rgba(0, 204, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#002B49',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#5A7C91'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(90, 124, 145, 0.1)'
                    },
                    ticks: {
                        color: '#5A7C91'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(90, 124, 145, 0.1)'
                    },
                    ticks: {
                        color: '#5A7C91'
                    }
                }
            }
        }
    });
});