export type Product = {
  name: string;
  slug: string;
  code: string;
  category: string;
  price: string;
  description: string;
  colour: string;
  seatWeight: string;
  maxUserWeight: string;
  armrests: string;
  warranty: string;
  features: string[];
  isBestseller?: boolean;
  imageUrl?: string;
  specs: {
    lumbar: string;
    armrests: string;
    back: string;
  };
};