declare module "dotaconstants" {
  export interface AbilityData {
    dname?: string;
    behavior?: string | string[];
    dmg_type?: string;
    bkbpierce?: string;
    desc?: string;
    attrib?: { key: string; header?: string; value: string | string[]; generated?: boolean }[];
    lore?: string;
    mc?: string | string[];
    cd?: string | string[];
    img?: string;
    [key: string]: unknown;
  }

  const dotaconstants: {
    ability_ids: Record<string | number, string>;
    abilities: Record<string, AbilityData>;
    [key: string]: unknown;
  };

  export default dotaconstants;
}
