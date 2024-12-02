import React from "react";
import { Button } from "../components/ui/button";
import VipTicketHero from "../components/VipTicketHero";
import { Linking } from "react-native";

const restaurants = [
  {
    name: "LA BARISIENNE - HAMBURGER & PIZZA",
    address: "Via Bruno Calvani 9, 70042 Mola di Bari",
    phone: "+39 080 4046085",
    website: "www.labarisienne.it",
  },
  {
    name: "RUTHLESS - GRILL & BEER",
    address: "Via del Trabaccolo 14, 70042 Mola di Bari",
    phone: "+39 391 154 7728",
    whatsapp: "https://wa.me/393911547728",
  },
  {
    name: "RISTORANTE VAN WESTERHOUT",
    address: "Via Di Vagno 75, 70042 Mola di Bari",
    phone: "+39 366 409 6252",
    facebook: "https://www.facebook.com/ristorantevanwesterhout/",
    book: "https://www.quandoo.it/place/ristorante-van-westerhout-103289",
  },
  {
    name: "PUGLIAINBOCCA - PIZZERIA & RESTAURANT",
    address: "Via Principe Amedeo 43, 70042 Mola di Bari",
    phone: "+39 080 474 1063",
    website: "www.pugliainbocca.it",
    deliveryCode: "NONNAVITTORIA",
  },
  {
    name: "CAFFÈ ADRIATICO - BAR & ICE CREAM",
    address: "Via Pier Delfino Pesce 7, 70042 Mola di Bari",
    phone: "+39 080 474 1057",
    whatsapp: "https://wa.me/393475610553",
  },
];

const RestaurantScreen = () => {
  const openInMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url);
  };

  return (
    <div 
      className="giftCardSection overflow-y-auto pb-24" 
      style={{
        height: 'calc(100vh - 88px)', // Altezza dello schermo meno l'altezza della navbar
        WebkitOverflowScrolling: 'touch', // Per scrolling fluido su iOS
        overscrollBehavior: 'none', // Previene lo scroll bounce
      }}
    >
      <VipTicketHero />
      <h2 className="sectionTitle">Partner Restaurants</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {restaurants.map((restaurant, index) => (
          <div className="card" key={index}>
            <div className="cardHeader">
              <h3 className="cardTitle">{restaurant.name}</h3>
              <div className="discountBadge glowing">
                <span className="discountText">10% OFF</span>
              </div>
            </div>
            <p
              className="cardText address"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => openInMaps(restaurant.address)}
            >
              {restaurant.address}
            </p>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => Linking.openURL(`tel:${restaurant.phone}`)}
            >
              Call {restaurant.phone}
            </Button>
            {restaurant.website && (
              <Button
                variant="link"
                className="w-full mt-2"
                onClick={() => Linking.openURL(`https://${restaurant.website}`)}
              >
                Visit Website
              </Button>
            )}
            {restaurant.whatsapp && (
              <Button
                variant="link"
                className="w-full mt-2"
                onClick={() => Linking.openURL(restaurant.whatsapp)}
              >
                Contact on WhatsApp
              </Button>
            )}
            {restaurant.facebook && (
              <Button
                variant="link"
                className="w-full mt-2"
                onClick={() => Linking.openURL(restaurant.facebook)}
              >
                Facebook Page
              </Button>
            )}
            {restaurant.book && (
              <Button
                variant="link"
                className="w-full mt-2"
                onClick={() => Linking.openURL(restaurant.book)}
              >
                Book A Table
              </Button>
            )}
            {restaurant.deliveryCode && (
              <p className="mt-2 text-sm text-gray-500">
                Delivery Code: {restaurant.deliveryCode}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantScreen;
