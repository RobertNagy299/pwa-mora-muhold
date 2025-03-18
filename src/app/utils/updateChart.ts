import { Chart } from "chart.js";

interface DataPointModel {
  uptime: number,
  [sensorMeasurement: string]: any,
}


export abstract class ChartService  {

  updateChart<TType extends DataPointModel>(chart: Chart, data: TType[]): void { // used to be any[]
   // console.log(`Data inside updateChart: ${JSON.stringify(data)}`)

    if (data === undefined || data.length < 1) {
      // console.error('Data is undefined inside updateChart')
      return;
    }
    const keys = Object.keys(data[0])
    if (keys.length !== 2) {
      console.error(`Chart data point object must have exactly two (2) keys! Currently, it has ${keys.length}: ${keys}`)
      return;
    }

    if (chart && data.length > 0) {
      data.forEach((reading: TType) => { // used to be any
        
        const uptime = reading.uptime;
        const sensorInfo = reading['voltage'] | reading['temperature'];
        // Update chart with new data
        if (chart !== null && chart.data.labels !== undefined) {
          chart.data.labels.push(uptime);
          chart.data.datasets[0].data.push(sensorInfo);
          if (chart.data.datasets[0].data.length > 30) {
            chart.data.datasets[0].data.shift()
          }
          if(chart.data.labels.length > 30) {
            chart.data.labels.shift()
          }
          chart.update();
        }

      });
    }
  }
}
