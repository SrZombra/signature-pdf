import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

class Response{
  mensaje: string = '';
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private http: HttpClient
  ) { }


  uploadDocument(data): Observable<Response>{
    return this.http.post<Response>('http://localhost:8080/handle-pdf', data);
  }

}
