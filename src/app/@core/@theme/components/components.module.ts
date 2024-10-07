import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CardComponent} from "./card/card.component";
import {CustomSelectComponent} from "./custom-select/custom-select.component";
import {FormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {CustomInputComponent} from "./custom-input/custom-input.component";
import {SpinnerComponent} from "./spinner/spinner.component";
import {CustomChartComponent} from "./custom-chart/custom-chart.component";
import {CanvasJSAngularChartsModule} from "@canvasjs/angular-charts";

const COMPONENTS = [
    CardComponent,
    CustomSelectComponent,
    CustomInputComponent,
    SpinnerComponent,
    CustomChartComponent
]

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    CanvasJSAngularChartsModule // todo: lazy load is needed probably.
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class ComponentsModule { }
