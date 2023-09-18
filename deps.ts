// export { defaultTraveler } from 'npm:astravel';
import * as astringMod from "https://esm.sh/astring@1.8.6";
import { parse } from "https://esm.sh/acorn@8.10.0";
import { fullAncestor } from "https://esm.sh/acorn-walk@8.2.0";

export const astring = astringMod;
export const acorn = { parse };
export const acornWalk = { fullAncestor };
