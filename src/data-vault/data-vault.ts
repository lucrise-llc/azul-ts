import AzulRequester from '../request';
import {
  createDataVaultSchema,
  deleteDataVaultSchema,
  CreateDataVault,
  CreateDataVaultResponse,
  DeleteDataVault,
  DeleteDataVaultResponse,
  createDataVaultResponseSchema,
  deleteDataVaultResponseSchema
} from './schemas';

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
  async create(input: CreateDataVault): Promise<CreateDataVaultResponse> {
    const response = await this.requester.request({
      body: createDataVaultSchema.parse(input),
      url: this.requester.url + '?ProcessDatavault'
    });

    return createDataVaultResponseSchema.parse(response);
  }

  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  async delete(input: DeleteDataVault): Promise<DeleteDataVaultResponse> {
    const response = await this.requester.request({
      body: deleteDataVaultSchema.parse(input),
      url: this.requester.url + '?ProcessDatavault'
    });

    return deleteDataVaultResponseSchema.parse(response);
  }
}

export default DataVault;
