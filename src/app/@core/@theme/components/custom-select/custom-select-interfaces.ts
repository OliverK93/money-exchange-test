export interface CustomSelectInterfaces<T> {
  bindKey?: Extract<keyof T, string>;
  bindLabel: Extract<keyof T, string>;
  options: T[];
}

export interface CustomSelectConfig<T> {
  customSelectData?: CustomSelectInterfaces<T>;
  bindWhole?: boolean;
  placeholder?: string;
  label?: string;
  customClass?: string;
}
