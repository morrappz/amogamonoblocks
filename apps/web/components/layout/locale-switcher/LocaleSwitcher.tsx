import { useLocale, useTranslations } from "next-intl";
// import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import LocaleSwitcherSelect from "./LocaleSwitcherSelector";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: "en",
          label: t("en"),
        },
        {
          value: "fr",
          label: t("fr"),
        },
      ]}
      label={t("label")}
    />
  );
}
