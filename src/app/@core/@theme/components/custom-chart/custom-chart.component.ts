import {Component, Input} from '@angular/core';
import {CustomChartConfig} from "./custom-chart-config";

@Component({
  selector: 'app-custom-chart',
  templateUrl: './custom-chart.component.html',
  styleUrl: './custom-chart.component.scss'
})
export class CustomChartComponent {
  @Input() config!: CustomChartConfig;
}
