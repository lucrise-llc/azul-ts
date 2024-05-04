import AzulRequester from '../request';
import { Create, CreateInput, Delete, DeleteInput, DataVaultResponse } from './shemas';

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
    return await this.requester.safeRequest({
      url: this.requester.url + '?ProcessDatavault',
      body: {
        ...Create.parse(input),
        trxType: DataVaultTransaction.CREATE
      }
    });
  }

  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  async delete(input: DeleteInput): Promise<DataVaultResponse> {
    return await this.requester.safeRequest({
      url: this.requester.url + '?ProcessDatavault',
      body: {
        ...Delete.parse(input),
        trxType: DataVaultTransaction.DELETE
      }
    });
  }
}

export default DataVault;
