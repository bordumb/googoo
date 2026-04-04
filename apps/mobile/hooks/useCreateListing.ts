import { useState } from "react";
import * as Haptics from "expo-haptics";

import type { ListingType, ItemCondition, AgeRange } from "@googoo/shared";

export interface ListingDraft {
  images: string[];
  title: string;
  description: string;
  category: string;
  condition: ItemCondition | null;
  ageRange: AgeRange | null;
  listingType: ListingType;
  priceCents: number | null;
  swapPreferences: string;
  ships: boolean;
}

const INITIAL_DRAFT: ListingDraft = {
  images: [],
  title: "",
  description: "",
  category: "",
  condition: null,
  ageRange: null,
  listingType: "sell",
  priceCents: null,
  swapPreferences: "",
  ships: false,
};

export function useCreateListing() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(INITIAL_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateDraft = (partial: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return draft.images.length > 0;
      case 1:
        return draft.title.length >= 3 && draft.category !== "" && draft.condition !== null;
      case 2:
        return (
          draft.listingType === "free" ||
          draft.listingType === "swap" ||
          (draft.listingType === "sell" && draft.priceCents !== null && draft.priceCents > 0)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const next = () => {
    if (step < 3 && canAdvance()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const submit = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const reset = () => {
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setIsSuccess(false);
  };

  return {
    step,
    draft,
    updateDraft,
    canAdvance,
    next,
    back,
    submit,
    reset,
    isSubmitting,
    isSuccess,
  };
}
