// Initialize Chart.js instances
const revenueCtx = document.getElementById('revenueChart').getContext('2d');
const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');

let revenueChart = new Chart(revenueCtx, {
    type: 'bar',
    data: {
        labels: [''],
        datasets: [{
            label: 'Doanh thu (VND)',
            data: [0],
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1,
            barThickness: 100
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Doanh thu (VND)' },
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('vi-VN');
                    }
                }
            },
            x: {
                title: { display: true, text: 'Ngày' }
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Doanh Thu' }
        }
    }
});

const topProductsChart = new Chart(topProductsCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Số lượng bán',
            data: [],
            backgroundColor: [
                'rgba(52, 152, 219, 0.6)',
                'rgba(46, 204, 113, 0.6)',
                'rgba(231, 76, 60, 0.6)',
                'rgba(241, 196, 15, 0.6)',
                'rgba(155, 89, 182, 0.6)'
            ],
            borderColor: [
                'rgba(52, 152, 219, 1)',
                'rgba(46, 204, 113, 1)',
                'rgba(231, 76, 60, 1)',
                'rgba(241, 196, 15, 1)',
                'rgba(155, 89, 182, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Số lượng' },
                ticks: { stepSize: 1 }
            },
            x: {
                title: { display: true, text: 'Sách' },
                ticks: {
                    callback: function (value, index, values) {
                        const title = this.getLabelForValue(value);
                        return title.length > 20 ? title.substring(0, 20) + '...' : title;
                    }
                }
            }
        },
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 5 Sách Bán Chạy' }
        }
    }
});

// Function to update revenue chart type and options
function updateRevenueChartType(filterType, labels, dataPoints) {
    revenueChart.destroy();

    const isSingleDay = filterType === 'today' || filterType === 'daily';
    const isMonthly = filterType === 'monthly';
    const chartType = isSingleDay || isMonthly ? 'bar' : 'line';
    const barThickness = isSingleDay ? 100 : isMonthly ? 'flex' : undefined; // Flex for monthly to fit multiple bars
    const pointStyle = chartType === 'line' ? 'circle' : false;
    const pointRadius = chartType === 'line' ? 5 : 0;

    revenueChart = new Chart(revenueCtx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: dataPoints,
                backgroundColor: chartType === 'bar' ? 'rgba(52, 152, 219, 0.6)' : 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: chartType === 'bar' ? 1 : 2,
                fill: chartType === 'line',
                barThickness: barThickness,
                pointStyle: pointStyle,
                pointRadius: pointRadius,
                tension: chartType === 'line' ? 0.4 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Doanh thu (VND)' },
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('vi-VN');
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: filterType === 'yearly' ? 'Tháng' : filterType === 'monthly' ? 'Tháng' : 'Ngày'
                    },
                    ticks: {
                        maxRotation: (filterType === 'monthly' || filterType === 'custom') && labels.length > 10 ? 45 : 0,
                        minRotation: (filterType === 'monthly' || filterType === 'custom') && labels.length > 10 ? 45 : 0
                    }
                }
            },
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: filterType === 'yearly' ? 'Doanh Thu Theo Năm' :
                        filterType === 'custom' ? 'Doanh Thu Theo Ngày' :
                            filterType === 'monthly' ? 'Doanh Thu Theo Tháng' :
                                'Doanh Thu'
                }
            }
        }
    });
}

async function applyFilters() {
    const timeFilter = document.getElementById('time-filter').value;
    const fromDate = new Date().toISOString().slice(0, 10);
    const toDate = new Date().toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10); // e.g., 2025-05-19
    const token = localStorage.getItem('token');
    const applyBtn = document.getElementById('apply-btn');
    const revenueChartContainer = document.querySelector('#revenueChart').parentElement;
    const topProductsChartContainer = document.querySelector('#topProductsChart').parentElement;



    // Validation
    if (timeFilter === 'custom' && (!fromDate || !toDate)) {
        alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc cho tùy chỉnh.');
        return;
    }
    if (timeFilter === 'custom' && new Date(toDate) < new Date(fromDate)) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo',
            text: 'Ngày kết thúc phải sau ngày bắt đầu.',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Show loading state
    applyBtn.disabled = true;
    revenueChartContainer.classList.add('loading');
    topProductsChartContainer.classList.add('loading');

    // Update date inputs based on time filter
    if (timeFilter === 'today' || timeFilter === 'daily') {
        document.getElementById('from-date').value = new Date().toISOString().slice(0, 10);
        document.getElementById('to-date').value = new Date().toISOString().slice(0, 10);
    } else if (timeFilter === 'monthly') {
        const yearMonth = fromDate ? fromDate.slice(0, 7) : '2025-05';
        document.getElementById('from-date').value = `${yearMonth}-01`;
        const lastDate = new Date(yearMonth + '-01');
        lastDate.setMonth(lastDate.getMonth() + 1);  // sang tháng sau
        lastDate.setDate(0);
        document.getElementById('to-date').value = lastDate.toISOString().slice(0, 10);
    } else if (timeFilter === 'yearly') {
        const year = fromDate ? fromDate.slice(0, 4) : '2025';
        document.getElementById('from-date').value = `${year}-01-01`;
        document.getElementById('to-date').value = `${year}-12-31`;
    }

    // Construct API URL
    let url;
    if (timeFilter === 'today' || timeFilter === 'daily') {
        url = `http://localhost:8080/api/statistic/daily?date=${today}`;
    } else if (timeFilter === 'monthly') {
        const year = fromDate.split('-')[0];
        const month = parseInt(fromDate.split('-')[1], 10);
        url = `http://localhost:8080/api/statistic/monthly?year=${year}&month=${month}`;
    } else if (timeFilter === 'yearly') {
        const year = fromDate.split('-')[0];
        url = `http://localhost:8080/api/statistic/yearly?year=${year}`;
    } else {
        url = `http://localhost:8080/api/statistic/custom?startDate=${fromDate}&endDate=${toDate}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token || ''}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();



        // Update stat cards
        document.querySelector('.stat-card:nth-child(1) .value').textContent = data.totalBooksSold || 0;
        document.querySelector('.stat-card:nth-child(2) .value').textContent = data.totalOrders || 0;
        document.querySelector('.stat-card:nth-child(3) .value').textContent = data.totalRevenue
            ? `${Math.round(data.totalRevenue).toLocaleString('vi-VN')} VND`
            : '0 VND';
        document.querySelector('.stat-card:nth-child(4) .value').textContent = data.totalCustomers || 0;

        // Update revenue chart
        let revenueLabels, revenueDataPoints;
        if (timeFilter === 'yearly' && data.monthlyRevenue) {
            revenueLabels = data.monthlyRevenue.map(m => `Tháng ${m.month}`);
            revenueDataPoints = data.monthlyRevenue.map(m => m.revenue);
        } else if ((timeFilter === 'custom' || timeFilter === 'monthly') && data.dailyRevenue) {
            revenueLabels = data.dailyRevenue.map(d => d.date);
            revenueDataPoints = data.dailyRevenue.map(d => d.revenue);
        } else {
            revenueLabels = [fromDate || today];
            revenueDataPoints = [data.totalRevenue || 0];
        }

        updateRevenueChartType(timeFilter, revenueLabels, revenueDataPoints);

        // Update top products chart
        const topBooks = data.topBooks || [];
        topProductsChart.data.labels = topBooks.map(book => book.title);
        topProductsChart.data.datasets[0].data = topBooks.map(book => book.quantity);
        topProductsChart.update();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.querySelector('.stat-card:nth-child(1) .value').textContent = '0';
        document.querySelector('.stat-card:nth-child(2) .value').textContent = '0';
        document.querySelector('.stat-card:nth-child(3) .value').textContent = '0 VND';
        document.querySelector('.stat-card:nth-child(4) .value').textContent = '0';
        updateRevenueChartType(timeFilter, [today], [0]);
        topProductsChart.data.labels = [];
        topProductsChart.data.datasets[0].data = [];
        topProductsChart.update();
        alert('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
    } finally {
        applyBtn.disabled = false;
        revenueChartContainer.classList.remove('loading');
        topProductsChartContainer.classList.remove('loading');
    }
}

// Initialize with today's data
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('time-filter').value = 'today';
    document.getElementById('from-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('to-date').value = new Date().toISOString().slice(0, 10);
    applyFilters();
});