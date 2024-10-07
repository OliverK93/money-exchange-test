import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CustomInputConfig} from "./custom-input-interfaces";

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ]
})
export class CustomInputComponent implements ControlValueAccessor {
  @Input() config!: CustomInputConfig;
  @Output() valueChange = new EventEmitter<string | number | undefined | null>;

  formattedValue?: string;
  private _value?: string | number;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

   set value(val: string | number | undefined) {
    if (val !== undefined) {
      this._value = val;
      let output = val;
      if (output && typeof output !== this.config.type) {
        switch (this.config.type) {
          case 'number':
            output = parseInt((output as string).replace(/,/g, '')); // :(
            break;
          case 'string':
            output = output.toString();
            break;
          default:
            return
        }
      }
      this.valueChange.emit(output);
      this.onChange(output);
      this.formatValue();
    }
  }

  get value(): string | number | undefined {
    return this._value;
  }

  onInputChange(val: string) {
    this.value = val;
    this.valueChange.emit(val);
  }

  private formatValue() {
    if (this.config?.formatPipe) {
      this.formattedValue = this.config.formatPipe(this._value);
    } else {
      this.formattedValue = this._value?.toString() ?? '';
    }
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
