export type ProfileRole = "user" | "team" | "founder";

export type ProfileDetails = {
  knitting_preferences: string[];
  favorite_fibres: string[];
  knitting_since: number | null;
  knitting_vibes: string[];
  role: ProfileRole;
};

export const PROFILE_PREFERENCE_OPTIONS = [
  { value: "sweaters", pl: "Swetry", en: "Sweaters" },
  { value: "cardigans", pl: "Kardigany", en: "Cardigans" },
  { value: "socks", pl: "Skarpety", en: "Socks" },
  { value: "hats", pl: "Czapki", en: "Hats" },
  { value: "shawls", pl: "Chusty", en: "Shawls" },
  { value: "accessories", pl: "Akcesoria", en: "Accessories" },
  { value: "amigurumi", pl: "Amigurumi", en: "Amigurumi" },
  { value: "everything", pl: "Wszystko po trochu", en: "A bit of everything" },
] as const;

export const PROFILE_FIBRE_OPTIONS = [
  { value: "merino", pl: "Merino", en: "Merino" },
  { value: "wool", pl: "Wełna", en: "Wool" },
  { value: "alpaca", pl: "Alpaka", en: "Alpaca" },
  { value: "mohair", pl: "Moher", en: "Mohair" },
  { value: "cotton", pl: "Bawełna", en: "Cotton" },
  { value: "linen", pl: "Len", en: "Linen" },
  { value: "silk", pl: "Jedwab", en: "Silk" },
  { value: "other", pl: "Inne", en: "Other" },
] as const;

export const PROFILE_VIBE_OPTIONS = [
  { value: "always-knitting", pl: "Zawsze mam coś na drutach", en: "Always have something on the needles" },
  { value: "new-projects", pl: "Wiecznie zaczynam nowe projekty", en: "Always starting new projects" },
  { value: "project-monogamist", pl: "Monogamistka projektowa", en: "One-project-at-a-time knitter" },
  { value: "yarn-without-plan", pl: "Kupuję włóczkę bez planu", en: "I buy yarn without a plan" },
  { value: "pattern-first", pl: "Najpierw wzór, potem włóczka", en: "Pattern first, yarn second" },
  { value: "one-more-skein", pl: "Jeszcze jeden motek na pewno się przyda", en: "One more skein will surely help" },
  { value: "no-gauge-swatch", pl: "Team próbka? Jaka próbka?", en: "Gauge swatch? What gauge swatch?" },
] as const;

export function profileOptionLabels(values: string[], language: "pl" | "en", options: readonly { value: string; pl: string; en: string }[]) {
  return values.map((value) => options.find((option) => option.value === value)?.[language] ?? value);
}

export function toggleProfileOption(values: string[], value: string, max: number) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return values.length < max ? [...values, value] : values;
}
