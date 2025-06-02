import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface EditorialConPedidos {
  idEditorial: string;
  nombre: string;
  numPedidos: number;
}

export interface PedidoEditorial {
  idPedido: number;
  fecha: string;
  numLibros: number;
  estado: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: EditorialConPedidos[];
}

export interface ApiResponsePedidos {
  status: string;
  message: string;
  data: PedidoEditorial[];
}

export interface LibroPedidoDetalle {
  idLibro: number;
  cantidad: number;
  unidadesRecibidas: number;
  nombre: string;
  ISBN: string;
  precio: number;
}

export interface PedidoDetalle {
  idPedido: number;
  fecha: string;
  idEditorial: number;
  libros: LibroPedidoDetalle[];
}

export interface ApiResponsePedidoDetalle {
  status: string;
  message: string;
  data: PedidoDetalle;
}

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

  getEditorialesConPedidos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.endpoint + '/editoriales-con-pedidos');
  }

  getPedidosPorEditorial(idEditorial: string): Observable<ApiResponsePedidos> {
    return this.http.get<ApiResponsePedidos>(`${this.endpoint}/editoriales/${idEditorial}/pedidos`);
  }

  getPedidoDetalle(idPedido: number): Observable<ApiResponsePedidoDetalle> {
    return this.http.get<ApiResponsePedidoDetalle>(`${this.endpoint}/${idPedido}`);
  }

  confirmarUnidadesRecibidas(datosRecepcion: any): Observable<any> {
    return this.http.put<any>(this.endpoint + '/unidades-recibidas', datosRecepcion);
  }
}