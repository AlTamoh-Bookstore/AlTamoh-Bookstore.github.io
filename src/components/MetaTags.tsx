import { Helmet } from 'react-helmet-async';

const MetaTags = () => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>مكتبة الطموح | Al-Tomoh Bookstore</title>
      <meta name="title" content="مكتبة الطموح | أفضل الكتب العربية المختارة بعناية" />
      <meta name="description" content="مكتبة الطموح تقدم أكثر من 5000 كتاب عربي متنوع لجميع الأعمار. اكتشف روايات، كتب دينية، علمية، تطوير ذات وأدب عربي أصيل. توصيل سريع لجميع أنحاء المملكة 📚" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://al-tomoh.com/" />
      <meta property="og:site_name" content="مكتبة الطموح" />
      <meta property="og:title" content="مكتبة الطموح | مكتبتك العربية المميزة 📚" />
      <meta property="og:description" content="أكثر من 5000 كتاب عربي متنوع من مختلف المجالات. روايات، علوم، أدب، تطوير ذات وأكثر. توصيل سريع وخدمة مميزة ✨" />
      <meta property="og:image" content="https://al-tomoh.com/assets/og-image.jpg" />
      <meta property="og:image:secure_url" content="https://al-tomoh.com/assets/og-image.jpg" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="مكتبة الطموح - أفضل الكتب العربية" />
      <meta property="og:locale" content="ar" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://al-tomoh.com/" />
      <meta name="twitter:title" content="مكتبة الطموح | مكتبتك العربية المميزة 📚" />
      <meta name="twitter:description" content="أكثر من 5000 كتاب عربي متنوع من مختلف المجالات. روايات، علوم، أدب، تطوير ذات وأكثر. توصيل سريع وخدمة مميزة ✨" />
      <meta name="twitter:image" content="https://al-tomoh.com/assets/og-image.jpg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://al-tomoh.com/" />
    </Helmet>
  );
};

export default MetaTags;