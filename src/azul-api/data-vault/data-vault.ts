import { Process } from '../processes';
import AzulRequester from '../request';
import { CreateInput, DataVaultResponse, DeleteInput } from './types';
import { Create, Delete } from './schemas';

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
      Create.parse({
        ...input,
        trxType: 'CREATE'
      }),
      Process.Datavault
    );
  }

  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  async delete(input: DeleteInput): Promise<DataVaultResponse> {
    return await this.requester.safeRequest(
      Delete.parse({
        ...input,
        trxType: 'DELETE'
      }),
      Process.Datavault
    );
  }
}

export default DataVault;
