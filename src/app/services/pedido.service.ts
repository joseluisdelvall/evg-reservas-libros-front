import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private endpoint = '/pedidos';

  constructor(private http: BaseService) {}

  addPedido(pedido: any): Observable<any> {
    // El endpoint es /api/pedidos/add
    return this.http.post<any>(this.endpoint + '/add', pedido);
  }
} 