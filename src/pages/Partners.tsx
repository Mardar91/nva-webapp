import React from "react";
import { Button } from "../components/ui/button";
import VipTicketHero from "../components/VipTicketHero";
import { Linking } from "react-native";

const attractions = [
  {
    category: "Shopping & Souvenirs",
    items: [
      {
        name: "FIORIROSA - FLOWERS & SOUVENIR",
        address: "Via Cesare Battisti 84, 70042 Mola di Bari",
        phone: "+39 340 307 5288",
      },
      {
        name: "CORDERIA PALMI - APULIA SOUVENIRS",
        address: "Via Veneto 30, 70042 Mola di Bari",
        phone: "+39 348 591 9451",
      },
    ],
  },
  {
    category: "Wellness & Fitness",
    items: [
      {
        name: "SELF CARE - MASSAGE & BEAUTY",
        address: "Via G. Salvemini, 17, 70042 Mola di Bari",
        phone: "+39 349 858 2919",
        website: "https://selfcare17.it",
      },
      {
        name: "ATHENA 2000 - GYM & FITNESS",
        address: "Via M. Colonna 97, 70042 Mola di Bari",
        phone: "+39 080 473 7070",
        website: "https://asdathena2000.it",
      },
    ],
  },
  {
    category: "Entertainment & Services",
    items: [
      {
        name: "GOMMOLAND - AMUSEMENT PARK",
        address: "Via Fiume angolo Via del Frascinaro 70042 Mola di Bari",
        phone: "+39 320 663 5921",
      },
      {
        name: "CAR RENTAL WITH DELIVERY SERVICE",
        address: "Via S. Giorgio, 9, 70019 Triggiano, BA",
        phone: "+39 349 342 5023",
        whatsapp: "https://wa.me/393493425023",
      },
    ],
  },
  {
    category: "Beaches",
    items: [
      {
        name: "NIRVANA BEACH",
        address: "Viale Pietro Delfino Pesce, 70042 Mola di Bari",
        phone: "+39 329 581 2127",
      },
    ],
  },
];

const openInMaps = (address: string) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  window.open(url, "_blank");
};

const PartnersScreen = () => {
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
      <h2 className="sectionTitle">Our Partners</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {attractions.map((category, index) => (
          <div key={index}>
            <h3 className="subSectionTitle">{category.category}</h3>
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="card">
                <div className="cardHeader">
                  <h4 className="cardTitle">{item.name}</h4>
                  <div className="discountBadge shimmer-button">
                    <span className="discountText">10% OFF</span>
                  </div>
                </div>
                <p
                  className="cardText address"
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => openInMaps(item.address)}
                >
                  {item.address}
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  Call {item.phone}
                </Button>
                {'website' in item && item.website && (
                  <Button
                    variant="link"
                    className="w-full mt-2"
                    onClick={() => Linking.openURL(item.website)}
                  >
                    Visit Website
                  </Button>
                )}
                {'whatsapp' in item && item.whatsapp && (
                  <Button
                    variant="link"
                    className="w-full mt-2"
                    onClick={() => Linking.openURL(item.whatsapp)}
                  >
                    Contact on WhatsApp
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersScreen;
