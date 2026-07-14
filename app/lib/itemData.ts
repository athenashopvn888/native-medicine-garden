export interface ItemEffects {
  effects: { emoji: string; label: string }[];
  description: string;
  metaDescription: string;
  consume: string;
}

export function getItemData(category: string, name: string): ItemEffects {
  const cat = category.toUpperCase();

  if (cat === "EDIBLES") {
    return {
      effects: [
        { emoji: "", label: "Long Lasting" },
        { emoji: "", label: "Body High" },
        { emoji: "", label: "Flavorful" },
      ],
      description: `${name} is an edible category item listed for Native Medicine Garden. Confirm current availability, package details, and THC information on the current menu or in store.`,
      metaDescription: `Browse ${name} cannabis edibles in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
      consume:
        "Start low and go slow. Edibles can take 45 to 120 minutes to take full effect. Wait before consuming more.",
    };
  }

  if (cat.includes("VAPE")) {
    return {
      effects: [
        { emoji: "", label: "Fast Acting" },
        { emoji: "", label: "Potent" },
        { emoji: "", label: "Discreet" },
      ],
      description: `${name} is a vape category item listed for Native Medicine Garden. Confirm current availability, compatibility, and product details before visiting.`,
      metaDescription: `Browse ${name} vape products in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
      consume:
        "Take small puffs and wait to gauge effects. Follow product packaging and store guidance.",
    };
  }

  if (cat === "CONCENTRATES") {
    return {
      effects: [
        { emoji: "", label: "Highly Potent" },
        { emoji: "", label: "Fast Acting" },
        { emoji: "", label: "Concentrated" },
      ],
      description: `${name} is a concentrate category item listed for Native Medicine Garden. Concentrates can be strong, so confirm details and use carefully.`,
      metaDescription: `Browse ${name} cannabis concentrates in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
      consume:
        "Use a small amount. Concentrates can be potent and should be consumed carefully.",
    };
  }

  if (cat === "PREROLLS") {
    return {
      effects: [
        { emoji: "", label: "Ready To Smoke" },
        { emoji: "", label: "Quick Onset" },
        { emoji: "", label: "Convenient" },
      ],
      description: `${name} is a pre-roll category item listed for Native Medicine Garden. Confirm strain, package size, and availability on the current menu.`,
      metaDescription: `Browse ${name} pre-rolls in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
      consume: "Light evenly, take small puffs, and wait to gauge effects.",
    };
  }

  if (cat === "MAGIC & OTHERS") {
    return {
      effects: [
        { emoji: "", label: "Specialty" },
        { emoji: "", label: "Menu Varies" },
      ],
      description: `${name} is a specialty category item listed for Native Medicine Garden. Availability and details may vary by menu update.`,
      metaDescription: `Browse ${name} specialty items in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
      consume: "Use as directed and confirm product details before purchase.",
    };
  }

  return {
    effects: [
      { emoji: "", label: "Category Item" },
      { emoji: "", label: "Menu Varies" },
    ],
    description: `${name} is listed as a category item at Native Medicine Garden. Confirm current details before visiting.`,
    metaDescription: `Browse ${name} in Toronto at Native Medicine Garden. Confirm current menu details before visiting.`,
    consume: "Use as directed on the packaging.",
  };
}
