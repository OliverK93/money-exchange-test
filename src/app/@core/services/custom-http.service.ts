import {HttpClient, HttpParams} from "@angular/common/http";

export abstract class CustomHttpService {
  constructor(protected http: HttpClient) { }

  protected _getQueryParams(qp?: {[key: string]: any}): HttpParams {
    let httpParams = new HttpParams();
    // qp = {...qp, app_id: environment.app_id};
    for (const key in qp) {
      if (qp[key] !== null) {
        httpParams = httpParams.append(key, String(qp[key]))
      }
    }

    return httpParams;
  }
}
