// 更新时间显示
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}
setInterval(updateTime, 1000);

// 加载数据并初始化图表
async function initCharts() {
    try {
        const response = await fetch('static/data.json');
        const data = await response.json();
        
        // 初始化词云图
        const wordCloudChart = echarts.init(document.getElementById('salesWordCloud').querySelector('.chart-content'));
        const wordCloudOption = {
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                left: 'center',
                top: 'center',
                width: '90%',
                height: '90%',
                right: null,
                bottom: null,
                sizeRange: [12, 60],
                rotationRange: [-45, 45],
                rotationStep: 45,
                gridSize: 8,
                drawOutOfBound: false,
                data: data.wordcloud,
                textStyle: {
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 'bold',
                    color: function() {
                        return 'rgb(' + [
                            Math.round(Math.random() * 40 + 160),
                            Math.round(Math.random() * 40 + 160),
                            Math.round(Math.random() * 40 + 160)
                        ].join(',') + ')';
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        wordCloudChart.setOption(wordCloudOption);

        // 初始化品牌销售占比饼图
        const brandPieChart = echarts.init(document.getElementById('brandPieChart').querySelector('.chart-content'));
        const brandPieOption = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'middle',
                textStyle: { color: '#fff' },
                itemGap: 12,
                formatter: function(name) {
                    if (name.length > 6) {
                        return name.substring(0, 6) + '...';
                    }
                    return name;
                }
            },
            series: [{
                name: '品牌销量',
                type: 'pie',
                radius: ['45%', '75%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.brand_pie
            }]
        };
        brandPieChart.setOption(brandPieOption);

        // 初始化价格区间分布图
        const priceRangeChart = echarts.init(document.getElementById('priceRangeChart').querySelector('.chart-content'));
        const priceRangeOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    const data = params[0];
                    return `${data.name}<br/>` +
                           `销量：${data.value.toLocaleString()} 辆<br/>` +
                           `占比：${data.data.percentage}%`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.price_range.map(item => item.range),
                axisLabel: { 
                    color: '#fff',
                    interval: 0,
                    rotate: 30
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255,255,255,0.3)'
                    }
                }
            },
            yAxis: [{
                type: 'value',
                name: '销量',
                nameTextStyle: {
                    color: '#fff'
                },
                axisLabel: { 
                    color: '#fff',
                    formatter: function(value) {
                        return (value / 10000).toFixed(1) + '万';
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255,255,255,0.3)'
                    }
                }
            }],
            series: [{
                name: '销量',
                type: 'bar',
                barWidth: '40%',
                data: data.price_range.map(item => ({
                    value: item.value,
                    percentage: item.percentage,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#1a90ff' },
                            { offset: 1, color: '#1a90ff30' }
                        ])
                    }
                })),
                itemStyle: {
                    borderRadius: [5, 5, 0, 0]
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: function(params) {
                        return params.data.percentage + '%';
                    },
                    color: '#fff',
                    fontSize: 12
                }
            }]
        };
        priceRangeChart.setOption(priceRangeOption);

        // 初始化销售趋势图
        const trendChart = echarts.init(document.getElementById('salesTrendChart').querySelector('.chart-content'));
        const trendOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function(params) {
                    const sales = params[0].value.toLocaleString();
                    const price = params[1].value.toFixed(2);
                    return `${params[0].name}<br/>` +
                           `销量：${sales} 辆<br/>` +
                           `最低价格：${price}万`;
                }
            },
            legend: {
                data: ['销量', '最低价格'],
                textStyle: { color: '#fff' },
                top: 10,
                right: 100,
                itemGap: 30
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.sales_ranking.map(item => item.name),
                axisLabel: {
                    color: '#fff',
                    interval: 0,
                    rotate: 30,
                    fontSize: 12
                },
                axisLine: {
                    lineStyle: { color: 'rgba(255,255,255,0.3)' }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '销量',
                    position: 'left',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: {
                        color: '#fff',
                        formatter: function(value) {
                            return (value / 10000).toFixed(1) + '万';
                        }
                    },
                    splitLine: {
                        lineStyle: { color: 'rgba(255,255,255,0.1)' }
                    },
                    axisLine: {
                        lineStyle: { color: 'rgba(255,255,255,0.3)' }
                    }
                },
                {
                    type: 'value',
                    name: '价格(万)',
                    position: 'right',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' },
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: { color: 'rgba(255,255,255,0.3)' }
                    }
                }
            ],
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    barWidth: '40%',
                    data: data.sales_ranking.map(item => item.sales),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#1890ff' },
                            { offset: 1, color: '#1890ff30' }
                        ]),
                        borderRadius: [5, 5, 0, 0]
                    }
                },
                {
                    name: '最低价格',
                    type: 'line',
                    yAxisIndex: 1,
                    symbol: 'circle',
                    symbolSize: 8,
                    data: data.sales_ranking.map(item => item.min_price),
                    itemStyle: {
                        color: '#ffd700',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    lineStyle: {
                        color: '#ffd700',
                        width: 2
                    },
                    smooth: true
                }
            ]
        };
        trendChart.setOption(trendOption);

        // 初始化销售排行榜表格
        const rankingTable = document.getElementById('salesRankingTable');
        const rankingContent = document.createElement('div');
        rankingContent.className = 'ranking-content';
        rankingContent.innerHTML = `
            <div class="ranking-header">
                <span>排名</span>
                <span>品牌</span>
                <span>车型</span>
                <span>类型</span>
                <span>能源</span>
                <span>销量</span>
                <span>价格(万)</span>
                <span>保修</span>
            </div>
            ${data.sales_ranking.map(item => `
                <div class="ranking-item">
                    <span class="rank">${item.rank}</span>
                    <span class="brand">${item.brand}</span>
                    <span class="name">${item.name}</span>
                    <span class="car-type">${item.car_type}</span>
                    <span class="energy-type">${item.energy_type}</span>
                    <span class="sales">${item.sales.toLocaleString()}</span>
                    <span class="price">${item.min_price.toFixed(2)}-${item.max_price.toFixed(2)}</span>
                    <span class="insurance">${item.insurance}</span>
                </div>
            `).join('')}
        `;
        rankingTable.appendChild(rankingContent);

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', function() {
            wordCloudChart.resize();
            brandPieChart.resize();
            priceRangeChart.resize();
            trendChart.resize();
        });

        // 初始化能源类型分布图
        initEnergyCharts(data);

    } catch (error) {
        console.error('���载数据失败:', error);
    }
}

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', initCharts); 

// 修改能源图表初始化函数
function initEnergyCharts(data) {
    const colors = {
        oil: '#ff6b6b',
        electric: '#4ecdc4',
        hybrid: '#45b7d1'
    };
    
    // 更新百分比显示
    document.getElementById('oilPercent').textContent = data.energy_distribution.data[0].value + '%';
    document.getElementById('electricPercent').textContent = data.energy_distribution.data[1].value + '%';
    document.getElementById('hybridPercent').textContent = data.energy_distribution.data[2].value + '%';
    
    const energyChart = echarts.init(document.getElementById('energyChart'));
    const energyOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            y: 'center',
            textStyle: { 
                color: '#fff',
                fontSize: 14
            },
            itemGap: 20,
            padding: [0, 0, 0, 50],
            itemWidth: 25,
            itemHeight: 14,
            formatter: name => name
        },
        series: [
            {
                name: '能源类型',
                type: 'pie',
                radius: ['30%', '50%'],
                center: ['30%', '50%'],
                avoidLabelOverlap: true,
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function(params) {
                        return params.value.toFixed(2) + '%';
                    },
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#fff',
                    distance: -15
                },
                labelLine: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold'
                    }
                },
                data: data.energy_distribution.data.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: {
                        color: item.name === '汽油车' ? colors.oil : 
                               item.name === '电动车' ? colors.electric : colors.hybrid
                    }
                }))
            }
        ]
    };
    energyChart.setOption(energyOption);
    
    // 添加到resize监听
    window.addEventListener('resize', function() {
        energyChart.resize();
    });
} 

// 添加到 script.js 末尾
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // 随机大小
        const size = Math.random() * 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机动画延迟
        particle.style.animationDelay = Math.random() * 20 + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// 添加到 script.js 末尾
function createGlowSpots() {
    const container = document.querySelector('.glow-spots');
    const spotCount = 5;

    for (let i = 0; i < spotCount; i++) {
        const spot = document.createElement('div');
        spot.className = 'glow-spot';
        
        // 随机位置
        spot.style.left = Math.random() * 100 + 'vw';
        spot.style.top = Math.random() * 100 + 'vh';
        
        // 随机大小
        const size = Math.random() * 150 + 50;
        spot.style.width = size + 'px';
        spot.style.height = size + 'px';
        
        // 随机动画延迟
        spot.style.animationDelay = Math.random() * 10 + 's';
        
        container.appendChild(spot);
    }
}

// 页面加载完成后创建粒子
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    createGlowSpots();
}); 