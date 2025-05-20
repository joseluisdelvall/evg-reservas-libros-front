import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Pedido, PedidoResponse } from '../models/pedido.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private endpoint = '/pedidos';

  constructor(private http: BaseService) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<PedidoResponse>(this.endpoint).pipe(
      map(response => response.data)
    );
  }
} 