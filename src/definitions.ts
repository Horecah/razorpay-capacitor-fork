export interface CheckoutPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  open(options: CheckoutOptions): Promise<{ response: string }>;
}

export interface CheckoutOptions {
  key: string;
  amount: string;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler?: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
}