export interface CustomChartConfig {
  chartData: {
    data: [{
      type: string,
      xValueFormatString?: string,
		  yValueFormatString?: string,
      dataPoints: {x: any, y: any}[],
    }]
  }; // :(
}
