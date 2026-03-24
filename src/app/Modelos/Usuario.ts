export interface Usuario {
  CodigoUsuario?: number;
  CodigoEmpresa?: number;
  CodigoRol?: number;
  NombreUsuario?: string;
  ClaveHash?: string;
  ClaveSalt?: string;
  SuperAdmin?: any;
  Estatus?: any;
}
