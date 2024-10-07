export interface CustomInputConfig {
  type: 'string' | 'number';
  placeholder?: string;
  label?: string;
  formatPipe?: (val: any) => string;
  customClass?: string;
}
