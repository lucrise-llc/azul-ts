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
    const response = await this.requester.safeRequest(
      createDataVaultSchema.parse(input),
      'ProcessDatavault'
    );

    return createDataVaultResponseSchema.parse(response);
  }

  /**
   * ### Delete: Eliminación de Token de Bóveda de Datos (DataVault)
   * Con esta transacción se solicita la eliminación de un token de la Bóveda de Datos.
   */
  async delete(input: DeleteDataVault): Promise<DeleteDataVaultResponse> {
    const response = await this.requester.safeRequest(
      deleteDataVaultSchema.parse(input),
      'ProcessDatavault'
    );

    return deleteDataVaultResponseSchema.parse(response);
  }
}

export default DataVault;
