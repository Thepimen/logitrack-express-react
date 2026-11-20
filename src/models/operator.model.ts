export interface WarehouseOperator {
  readonly id: string;
  readonly badgeId: string;
  readonly fullName: string;
  readonly email: string;
  readonly role: string;
  readonly assignedHub: string;
  readonly shift: string;
  readonly active: boolean;
}

export interface WarehouseOperatorRow {
  id: string;
  badge_id: string;
  full_name: string;
  email: string;
  access_pin?: string;
  role: string;
  assigned_hub: string;
  shift: string;
  active: boolean;
}
