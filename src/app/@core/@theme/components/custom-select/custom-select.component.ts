import {Component, EventEmitter, forwardRef, Input, Output, SimpleChanges} from '@angular/core';
import {CustomSelectConfig, CustomSelectInterfaces} from "./custom-select-interfaces";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent<T = any> implements ControlValueAccessor {
  @Input() config!: CustomSelectConfig<T>
  @Output() valueChange = new EventEmitter<T>;

  placeholder?: string;
  label?: string;

  private _value?: T;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // COMMON VALUES

  get items(): T[] {
    return this.config.customSelectData?.options!
  }

  get bindLabel(): string {
    return this.config.customSelectData?.bindLabel!
  }

  get bindKey(): string {
    return this.config.bindWhole ? '' : this.config.customSelectData?.bindKey!;
  }

  // CONTROLS

  get value(): T | undefined {
    return this._value;
  }

  set value(val: T | undefined) {
    if (val !== undefined) {
      this._value = val;
      this.onChange(val);
      this.valueChange.emit(val);
    }
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
