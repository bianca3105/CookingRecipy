export const FOLDER_DEFS = [
  { key: "desayunos", name: "Desayunos" },
  { key: "bebidas", name: "Bebidas" },
  { key: "ensaladas", name: "Ensaladas" },
  { key: "dips", name: "Dips" },
  { key: "sopas", name: "Sopas" },
  { key: "entradas", name: "Entradas" },
  { key: "comida-de-leche", name: "Comida de leche" },
  { key: "comida-de-carne", name: "Comida de carne" },
  { key: "acompanamientos", name: "Acompañamientos" },
  { key: "postres", name: "Postres" },
] as const;

export type FolderKey = (typeof FOLDER_DEFS)[number]["key"];
