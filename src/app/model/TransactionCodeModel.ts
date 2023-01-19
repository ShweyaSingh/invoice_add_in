export class TransactionCodeModel {
  transaction_code_id: number;
  name: string;
  description: string;
  used_for_grants: boolean;

  public constructor(
    transactionCodeId: number,
    name: string,
    description: string,
    usedForGrants: boolean
  ) {
    this.transaction_code_id = transactionCodeId;
    this.name = name;
    this.description = description;
    this.used_for_grants = usedForGrants;
  }
}
