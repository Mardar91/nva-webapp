import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Heart, Sparkles, ArrowRight, Wine } from "lucide-react";
import { useTranslation } from "react-i18next";
import RomanticWeekModal from "./RomanticWeekModal";

const SpecialOffers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRomanticWeekOpen, setIsRomanticWeekOpen] = useState(false);

  return (
    <div className="px-5">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('specialOffers.title')}</h2>
      </div>

      {/* Offers Container */}
      <div className="space-y-4">
        {/* Gift Card Offer */}
        <div
          onClick={() => navigate("/gift-card")}
          className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-white text-xs font-semibold">{t('specialOffers.giftCard.badge')}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{t('specialOffers.giftCard.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {t('specialOffers.giftCard.description')}
                </p>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4">
                <Gift className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 mt-4 text-white/90 group-hover:text-white transition-colors">
              <span className="text-sm font-medium">{t('specialOffers.giftCard.cta')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Romantic Week Offer */}
        <div
          onClick={() => setIsRomanticWeekOpen(true)}
          className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-red-600" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                  <Heart className="h-3 w-3 text-white fill-white" />
                  <span className="text-white text-xs font-semibold">{t('specialOffers.romanticWeek.badge')}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{t('specialOffers.romanticWeek.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {t('specialOffers.romanticWeek.description')}
                </p>

                {/* Price Tag */}
                <div className="inline-flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                  <Wine className="h-4 w-4 text-white" />
                  <span className="text-white font-bold">{t('specialOffers.romanticWeek.price')}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4">
                <Heart className="h-7 w-7 text-white fill-white/50" />
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 mt-4 text-white/90 group-hover:text-white transition-colors">
              <span className="text-sm font-medium">{t('specialOffers.romanticWeek.cta')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <RomanticWeekModal
        isOpen={isRomanticWeekOpen}
        onClose={() => setIsRomanticWeekOpen(false)}
      />
    </div>
  );
};

export default SpecialOffers;
