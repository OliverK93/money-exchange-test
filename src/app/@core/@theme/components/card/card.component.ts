import {Component, HostBinding, Input} from '@angular/core';
import {disableElement} from '../animations';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    class: 'card'
  },
  animations: [disableElement]
})
export class CardComponent {
  @Input() disabled: boolean = false;
  @HostBinding('@disableElement') get disabledState() {return this.disabled ? 'disabled' : 'active'}
}
