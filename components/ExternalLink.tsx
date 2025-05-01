/**
 * 外部連結組件
 *
 * 用於處理應用程式內的外部連結，功能包括：
 * - 在網頁平台上打開新標籤頁
 * - 在移動端平台使用內建瀏覽器開啟連結
 * - 保留所有Link組件原始功能和屬性
 */

import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { type ComponentProps } from "react";
import { Platform } from "react-native";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async event => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
