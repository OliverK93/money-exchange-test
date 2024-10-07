import {animate, group, query, state, style, transition, trigger} from "@angular/animations";

export const fadeInOut = trigger('fadeInOut', [
  state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
  state('*', style({transform: 'translateY(0)', opacity: 1 })),
  transition('void <=> *', animate(150)),
]);

export const disableElement = trigger('disableElement', [
  state('true', style({opacity: 0.6, transform: 'scale(0.95)'})),
  state('false', style({opacity: 1, transform: 'scale(1)'})),
  transition('true <=> false', animate('200ms ease-in-out'))
])

export const nudgeElement = trigger('nudgeElement', [
  state('true', style({transform: 'scale(1.01)', transition: '200ms'})),
  state('false', style({transform: 'scale(1)', transition: '200ms'})),
])

export const grow = trigger('grow', [
  transition('* => *', [
    query(':self', [
      style({height: '{{startHeight}}px'})
    ]),
    query(':enter', [
      style({opacity: 0, scale: 0.9})
    ]),
    query(':leave', [
      style({opacity: 1, scale: 1}),
      animate('0.2s ease-in', style({opacity: 0, scale: 0.9}))
    ]),
    group([
      query(':self', [
        animate('0.2s ease-in', style({height: '*'}))
      ]),
      query(':enter', [
        animate('0.2s ease-in', style({opacity: 1, scale: 1}))
      ]),
    ], { params: { startHeight: 0 } })
  ])
])
