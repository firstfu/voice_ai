// This file is a fallback for using MaterialIcons on Android and web.

import { StyleProp, TextStyle, View, Platform, OpaqueColorValue } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

// 擴展圖標映射支持更多圖標類型
const MAPPING: Record<string, React.ComponentProps<typeof MaterialIcons>["name"]> = {
  house: "home",
  "house.fill": "home",
  gearshape: "settings",
  "gearshape.fill": "settings",
  paperplane: "send",
  "paperplane.fill": "send",
  mic: "mic",
  "mic.fill": "mic",
  apps: "apps",
  briefcase: "work",
  school: "school",
  person: "person",
  search: "search",
  "ellipsis-horizontal": "more-horiz",
  play: "play-arrow",
  "chevron-forward": "chevron-right",
  "close-circle": "cancel",
  "time-outline": "access-time",
  "document-text-outline": "description",
  "notifications-outline": "notifications",
  "arrow-back": "arrow-back",
  "cloud-upload": "cloud-upload",
  "mail-outline": "mail-outline",
  "globe-outline": "language",
  "key-outline": "vpn-key",
  "pie-chart-outline": "pie-chart",
  "help-circle": "help",
  "code-slash": "code",
  "information-circle": "info",
};

type IconSymbolName = keyof typeof MAPPING;
type SymbolWeight = "regular" | "semibold" | "bold";

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
