import { ProcessPaymentTransaction } from '../process-payment/process-payment';
import { ProcessPaymentResponse } from '../process-payment/schemas';
import { Process } from '../processes';
import AzulRequester from '../request';
import {
  Create,
  CreateInput,
  DataVaultResponse,
  DataVaultSaleInput,
  DataVaultSaleSchema
} from './schemas';

enum DataVaultTransaction {
  CREATE = 'CREATE',
  DELETE = 'DELETE'
}

class DataVault {
  private readonly requester: AzulRequester;

  constructor(requester: AzulRequester) {
    this.requester = requester;
  }

  /**
   * ### Create: Creación de Token con Bóveda de Datos (DataVault)
   * Con esta transacción se solicita un token para ser utilizado en sustitución de la tarjeta,
   * sin necesidad de realizar una venta.
   */
  async create(input: CreateInput): Promise<DataVaultResponse> {
    return await this.requester.safeRequest(
      {
        ...Create.parse(input),
        trxType: DataVaultTransaction.CREATE
      },
      Process.Datavault
    );
  }

  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  async delete(dataVaultToken: string): Promise<DataVaultResponse> {
    return await this.requester.safeRequest(
      {
        dataVaultToken,
        trxType: DataVaultTransaction.DELETE
      },
      Process.Datavault
    );
  }

  /**
   * ### Sale: Transacción de Venta
   * Te permite realizar una transacción de venta con un token generado por la transacción
   * de DataVault.
   */
  async sale(input: DataVaultSaleInput): Promise<ProcessPaymentResponse> {
    return await this.requester.safeRequest({
      ...DataVaultSaleSchema.parse(input),
      expiration: '',
      trxType: ProcessPaymentTransaction.SALE
    });
  }
}

export default DataVault;
