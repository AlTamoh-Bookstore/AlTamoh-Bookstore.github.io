import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirOf, isLocale } from "@/lib/i18n";
import { getTryPerUsd } from "@/lib/data";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "مكتبة الطموح — Al-Tomoh Bookstore",
    template: "%s — Al-Tomoh",
  },
  description:
    "الطموح مكتبة إلكترونية راقية للكتب الورقية. أدب وتاريخ وعلوم وفكر منتقاة بعناية — تصلكم داخل تركيا وحول العالم. Al-Tomoh is a premium online bookstore for printed books.",
  keywords: [
    "مكتبة",
    "كتب ورقية",
    "الطموح",
    "bookstore",
    "physical books",
    "Al-Tomoh",
    "buy books online",
  ],
  openGraph: {
    title: "مكتبة الطموح — Al-Tomoh Bookstore",
    description: "مكتبة راقية مكرّسة للكلمة المطبوعة.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();

  const currencyCookie = cookieStore.get(CURRENCY_COOKIE)?.value;
  const initialCurrency = isCurrency(currencyCookie) ? currencyCookie : DEFAULT_CURRENCY;

  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  const tryPerUsd = await getTryPerUsd();

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={fontVariables}
      // The store ships its own Arabic/English switcher. Browser auto-translate
      // (Chrome/Edge/Brave) would rewrite the DOM underneath React — which
      // silently reverts or wipes what an admin types into a form, and can
      // "translate" English text back into Arabic. Opt the page out of it.
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="flex min-h-screen flex-col font-sans notranslate">
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <CurrencyProvider initialCurrency={initialCurrency} tryPerUsd={tryPerUsd}>
              <CartProvider>{children}</CartProvider>
            </CurrencyProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
