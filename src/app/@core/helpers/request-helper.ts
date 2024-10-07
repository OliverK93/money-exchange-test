import {catchError, Observable, share, Subject, takeUntil, tap} from "rxjs";

export interface RequestHelperConfig {
  cancel$?: Subject<void>;
  destroy$?: Subject<void>;
}

export class RequestHelper <T, P> {
  get isPending(): boolean {
    return this._isPending;
  }

  get status() {
    return this._status;
  }

  private _isPending: boolean = false;
  private _cancel$ = new Subject<void>();
  private _destroy$ = new Subject<void>();
  private _request: (args: P[]) => Observable<T>;
  private _status?: 'PENDING' | 'SUCCESS' | 'ERROR';
  constructor(private req: (args: P[]) => Observable<T>, private config?: RequestHelperConfig) {
    this._request = req;
    if (config?.cancel$) config.cancel$.subscribe(() => this._cancel$);
    if (config?.destroy$) config.destroy$.subscribe(() =>this._destroy$);
  }

  call(...args: P[]) {
    this._cancel$.next();
    this._isPending = true;
    this._status = 'PENDING';
    const request =  this._request(args).pipe(
      takeUntil(this._cancel$),
      catchError(err => {
        this._isPending = false;
        this._status = 'ERROR';
        throw err
      }),
      tap(() => {
        this._isPending = false;
        this._status = 'SUCCESS';
      }),
      share()
    );
    request.subscribe();
    return request;
  }
}
