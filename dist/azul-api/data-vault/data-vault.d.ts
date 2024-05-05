import { ProcessPaymentResponse } from '../process-payment/schemas';
import AzulRequester from '../request';
import { CreateInput, DataVaultResponse, DataVaultSaleInput } from './shemas';
declare class DataVault {
  private readonly requester;
  constructor(requester: AzulRequester);
  /**
   * ### Create: Creación de Token con Bóveda de Datos (DataVault)
   * Con esta transacción se solicita un token para ser utilizado en sustitución de la tarjeta,
   * sin necesidad de realizar una venta.
   */
  create(input: CreateInput): Promise<DataVaultResponse>;
  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  delete(dataVaultToken: string): Promise<DataVaultResponse>;
  /**
   * ### Sale: Transacción de Venta
   * Te permite realizar una transacción de venta con un token generado por la transacción
   * de DataVault.
   */
  sale(input: DataVaultSaleInput): Promise<ProcessPaymentResponse>;
}
export default DataVault;
//# sourceMappingURL=data-vault.d.ts.map
