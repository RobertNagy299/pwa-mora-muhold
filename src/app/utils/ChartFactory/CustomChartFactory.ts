import { Chart, ChartConfiguration, ChartData, ChartOptions } from "chart.js";

import { Injectable } from "@angular/core";
import { ChartTypeEnum } from "../constants";



//#region interfaces
interface CustomChartData extends ChartData {

}


interface CustomChartOptions extends ChartOptions {

}


interface CustomChartConfiguration extends ChartConfiguration {}

//#endregion

//#region Chart Factory Class
@Injectable({
  providedIn: 'root'
})
export class ChartFactory {

  //#region default config data
  private readonly DefaultDataConfig: CustomChartData = {
    labels: [],
    datasets: [{
      data: [],
      fill: false,
    }],
  }

  private readonly DefaultDataOptions: CustomChartOptions = {
    responsive: true,
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Uptime (s)',
        },
      },
      y: {
        title: {
          display: true,
        }
      }
    }
  }

  private readonly DefaultChartConfig: CustomChartConfiguration = {
    type: 'line',
    data: {
      ...this.DefaultDataConfig,
    },
    options: {
      ...this.DefaultDataOptions,
    }
  }
  //#endregion

//#region voltage config
  private readonly voltageData = {
    ...this.DefaultDataConfig,
    datasets: [{
      label: 'Voltage',
      borderColor: 'rgb(75, 192, 192)',
      data: [],
      fill: false,
    }]
  }

  private readonly voltageOptions = {
    ...this.DefaultDataOptions,
    
    scales: {
      y: {
        title: {
          display: true,
          text: 'Voltage (V)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Uptime (s)',
        }
      }
    }

  }

  private readonly VoltageChartConfig: CustomChartConfiguration = {
    ...this.DefaultChartConfig,
    data: {...this.voltageData},
    options: {...this.voltageOptions},
    
  }
  //#endregion


  //#region temperature config
  private readonly temperatureData = {
    ...this.DefaultDataConfig,
    datasets: [{
      label: 'Temperature',
      borderColor: 'rgb(255,110,17)',
      data: [],
      fill: false,
    }]
  }

  private readonly temperatureOptions = {
    ...this.DefaultDataOptions,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        }
      },

      x: {
        title: {
          display: true,
          text: 'Uptime (s)',
        }
      }
    }

  }

  private readonly TemperatureChartConfig: CustomChartConfiguration = {
    ...this.DefaultChartConfig,
    data: {...this.temperatureData},
    options: {...this.temperatureOptions},

  }
  //#endregion
  
  //#region public factory method
  public createChart(chartElement: HTMLCanvasElement, chartType: ChartTypeEnum) : Chart {

    switch (chartType) {
      case ChartTypeEnum.VOLTAGE: {
        return new Chart(chartElement, {
          ...this.VoltageChartConfig
        })
      }
      case ChartTypeEnum.TEMPERATURE: {
        return new Chart(chartElement, {
          ...this.TemperatureChartConfig
        })
      }
    }
  }
  //#endregion

}
//#endregion
