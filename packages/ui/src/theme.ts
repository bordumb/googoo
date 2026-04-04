import { colors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { spacing } from "./tokens/spacing";
import { typography } from "./tokens/typography";

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type Theme = typeof theme;
