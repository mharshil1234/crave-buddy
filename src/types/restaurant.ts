export type RestaurantDetails = {
  name: string;
  restaurantImg: string;
  location: string;
  cuisines: string[];
  rating: number;
  priceForTwo: number;
  deliveryTime: string;
};

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    veg: boolean;
    category: string;
    rating: number;
    img: string;
}

export type restaurantCartData = {
    restaurantName: string;
    restaurantImg: string;
    restaurantTotal: number;
    items: {
        id: string;
        name: string;
        price: number;
        img: string;
        isVeg: boolean;
        quantity: number;
        total: number;
    }[]
}