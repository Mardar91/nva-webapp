import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

const ServicesSection = () => {
  const [openWineModal, setOpenWineModal] = useState(false);
  const [openCleanModal, setOpenCleanModal] = useState(false);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const [openRentCarModal, setOpenRentCarModal] = useState(false);
  const [openExcursionsModal, setOpenExcursionsModal] = useState(false);
  const [openParkingModal, setOpenParkingModal] = useState(false);
  const [openBreakfastModal, setOpenBreakfastModal] = useState(false);
  const [openMassageModal, setOpenMassageModal] = useState(false);
  const [openRentBikeModal, setOpenRentBikeModal] = useState(false);
  const [openLaundryModal, setOpenLaundryModal] = useState(false);

  const services = [
    {
      name: "Taxi",
      icon: "🚕",
      onClick: () => (window.location.href = "/taxi"),
    },
    {
      name: "Wine",
      icon: "🍷",
      onClick: () => setOpenWineModal(true),
    },
    {
      name: "Clean",
      icon: "🧹",
      onClick: () => setOpenCleanModal(true),
    },
    {
      name: "Shop",
      icon: "🛍️",
      onClick: () => (window.location.href = "/shop"),
    },
    {
      name: "Delivery",
      icon: "🍔",
      onClick: () => setOpenDeliveryModal(true),
    },
    {
      name: "Rent Car",
      icon: "🚗",
      onClick: () => setOpenRentCarModal(true),
    },
    {
      name: "Excursions",
      icon: "⛵️",
      onClick: () => setOpenExcursionsModal(true),
    },
    {
      name: "Parking",
      icon: "🅿️",
      onClick: () => setOpenParkingModal(true),
    },
    {
      name: "Breakfast",
      icon: "🥐",
      onClick: () => setOpenBreakfastModal(true),
    },
    {
      name: "Massage",
      icon: "💆",
      onClick: () => setOpenMassageModal(true),
    },
    {
      name: "Rent a Bike",
      icon: "🚲",
      onClick: () => setOpenRentBikeModal(true),
    },
    {
      name: "Laundry",
      icon: "🧺",
      onClick: () => setOpenLaundryModal(true),
    },
  ];

  const parkingStreets = [
    {
      name: "Corso Regina Margherita",
      address: "Corso Regina Margherita, 70042 Mola di Bari",
    },
    {
      name: "Via Enrico Toti",
      address: "Via Enrico Toti, 70042 Mola di Bari",
    },
    {
      name: "Via De Gasperi",
      address: "Via De Gasperi, 70042 Mola di Bari",
    },
    {
      name: "Via Gramsci",
      address: "Via Gramsci, 70042 Mola di Bari",
    },
  ];

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  return (
    <div className="bg-white mt-5 pt-4 pb-8">
      <div className="spacer"></div>
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-bold text-blue-900 mb-6 ml-4">Our Services</h2>
        <div className="grid grid-cols-4 gap-4 justify-items-center mx-auto max-w-lg">
          {services.map((service) => (
            <Button
              key={service.name}
              variant="ghost"
              onClick={service.onClick}
              className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg hover:shadow-lg h-16 w-16"
            >
              <span className="text-2xl mb-1">{service.icon}</span>
              <span className="text-blue-900 font-medium text-xs">{service.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Previous modals remain unchanged */}
      
      {/* Updated Excursions Modal */}
      <Dialog open={openExcursionsModal} onOpenChange={setOpenExcursionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discover Amazing Excursions</DialogTitle>
            <DialogDescription>
              Experience incredible adventures and unforgettable moments in our beautiful region.
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    window.open("https://www.getyourguide.com/monopoli-l98256/polignano-a-mare-tour-privato-in-barca-con-aperitivo-t787847", "_blank");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🚤 Boat Tours
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* New Breakfast Modal */}
      <Dialog open={openBreakfastModal} onOpenChange={setOpenBreakfastModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Breakfast Service</DialogTitle>
            <DialogDescription>Coming soon</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* New Massage Modal */}
      <Dialog open={openMassageModal} onOpenChange={setOpenMassageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Massage Service</DialogTitle>
            <DialogDescription>
              Book a massage directly in your apartment. Subject to availability.
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    window.open("https://nonnavittoriaapartments.it/massage.pdf", "_blank");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Price List
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "https://wa.me/491794265253";
                  }}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  Contact on WhatsApp
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* New Rent a Bike Modal */}
      <Dialog open={openRentBikeModal} onOpenChange={setOpenRentBikeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rent a Bike</DialogTitle>
            <DialogDescription>
              Rent a bicycle for quick and easy transportation. Check availability.
              <div className="mt-4">
                <Button
                  onClick={() => {
                    window.location.href = "https://wa.me/393458381107";
                  }}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  Check Availability on WhatsApp
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* New Laundry Modal */}
      <Dialog open={openLaundryModal} onOpenChange={setOpenLaundryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laundry Services</DialogTitle>
            <DialogDescription>
              If you need professional wash, you can visit:
              <div className="mt-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => openInMaps("Via G. Salvemini, 5/B, 70042 Mola di Bari")}
                  className="justify-start text-left"
                >
                  Via G. Salvemini, 5/B, 70042 Mola di Bari
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "tel:+390804733856";
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Call Now
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Previous modals remain unchanged */}

    </div>
  );
};

export default ServicesSection;
