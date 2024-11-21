import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const ServicesSection = () => {
  const [openWineModal, setOpenWineModal] = useState(false);
  const [openCleanModal, setOpenCleanModal] = useState(false);

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
  ];

  return (
    <div className="bg-white mt-5 pt-4 pb-8">
      <div className="spacer"></div> {/* Aggiungi questo elemento */}
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-bold text-blue-900 mb-6 ml-4">
          Our Services
        </h2>
        <div className="grid grid-cols-4 gap-4 justify-items-center mx-auto max-w-lg">
          {services.map((service) => (
            <Button
              key={service.name}
              variant="ghost"
              onClick={service.onClick}
              className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg hover:shadow-lg h-16 w-16"
            >
              <span className="text-2xl mb-1">{service.icon}</span>
              <span className="text-blue-900 font-medium text-xs">
                {service.name}
              </span>
            </Button>
          ))}
        </div>
      </div>
      <Dialog open={openWineModal} onOpenChange={setOpenWineModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Service</DialogTitle>
            <DialogDescription>
              Request a bottle of wine or prosecco to be available upon arrival
              at a special price (subject to availability). To place an order,
              contact us on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              const phoneNumber = "+393458381107";
              window.location.href = `https://wa.me/${phoneNumber}`;
              setOpenWineModal(false);
            }}
            className="bg-[#25D366] hover:bg-[#128C7E]"
          >
            Contact us on WhatsApp
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={openCleanModal} onOpenChange={setOpenCleanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cleaning Service</DialogTitle>
            <DialogDescription>
              Request a cleaning service during your stay for €20.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              const message = encodeURIComponent(
                "Hello, I would like to request a cleaning service for my apartment. Please let me know the available time slots."
              );
              const phoneNumber = "+393458381107";
              window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
              setOpenCleanModal(false);
            }}
            className="bg-[#25D366] hover:bg-[#128C7E]"
          >
            Request on WhatsApp
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesSection;
