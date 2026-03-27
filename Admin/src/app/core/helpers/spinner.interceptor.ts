import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  private requests = 0;

  constructor(private spinner: NgxSpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.requests === 0) {
      this.spinner.show();
    }
    this.requests++;

    return next.handle(req).pipe(
      finalize(() => {
        this.requests--;
        if (this.requests === 0) {
          this.spinner.hide();
        }
      })
    );
  }
}
