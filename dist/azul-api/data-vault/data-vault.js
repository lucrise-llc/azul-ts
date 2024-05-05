import { ProcessPaymentTransaction } from '../process-payment/process-payment ';
import { Process } from '../processes';
import { Create, DataVaultSaleSchema } from './shemas';
var DataVaultTransaction;
(function (DataVaultTransaction) {
  DataVaultTransaction['CREATE'] = 'CREATE';
  DataVaultTransaction['DELETE'] = 'DELETE';
})(DataVaultTransaction || (DataVaultTransaction = {}));
class DataVault {
  constructor(requester) {
    Object.defineProperty(this, 'requester', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.requester = requester;
  }
  /**
   * ### Create: Creación de Token con Bóveda de Datos (DataVault)
   * Con esta transacción se solicita un token para ser utilizado en sustitución de la tarjeta,
   * sin necesidad de realizar una venta.
   */
  async create(input) {
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
  async delete(dataVaultToken) {
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
  async sale(input) {
    return await this.requester.safeRequest({
      ...DataVaultSaleSchema.parse(input),
      expiration: '',
      trxType: ProcessPaymentTransaction.SALE
    });
  }
}
export default DataVault;
//# sourceMappingURL=data-vault.js.map
