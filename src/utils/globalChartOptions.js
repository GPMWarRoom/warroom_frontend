export class globalChartOptions {
    constructor() {
        this.textStyle = {
            color: '#fff',
            fontSize: 12
        }
        this.title = {
            text: '123',
            textStyle: {
                color: '#fff',
                fontSize: 12
            }
        }
        this.grid = {
            top: '20%',
            left: '3%',
            right: '9%',
            bottom: '3%',
            containLabel: true
        }
        this.tooltip = {
            trigger: 'axis',
            backgroundColor: 'rgba(50,50,50,0.9)',
            borderColor: '#333',
            textStyle: {
                color: '#fff'
            }
        }
        this.xAxis = {
            name: '時間',
            axisLine: {
                lineStyle: {
                    color: '#666'
                }
            },
            axisLabel: {
                color: '#fff',
                fontSize: 11
            }
        }
        this.yAxis = {
            axisLine: {
                lineStyle: {
                    color: '#666'
                }
            },
            axisLabel: {
                color: '#fff',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#333'
                }
            }
        }
        this.series = [{ name: '數據', type: 'line', data: [] }]
    }
}
