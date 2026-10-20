export const LANGS = ['en', 'fi', 'de', 'fr', 'es', 'it', 'zh'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  fi: 'Suomi',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  zh: '中文',
};

const en = {
  tour: 'Northern Lights Tour',
  title: 'Get your northern lights photos',
  lead: "Leave your email and we'll send you the photos from tonight's tour.",
  group: 'Group',
  groupInput: 'Group number',
  groupHelp: "Ask your guide if you're not sure.",
  email: 'Email address',
  emailPlaceholder: 'name@example.com',
  submit: 'Send me my photos',
  sending: 'Sending…',
  privacy: 'We use your email only to send you the photos from this tour and delete it within {days} days.',
  privacyLink: 'Privacy policy',
  didYouMean: 'Did you mean {email}?',
  errEmail: 'Please check your email address.',
  errGroup: 'Please enter your group number.',
  errServer: 'Something went wrong. Please try again in a moment.',
  doneTitle: "You're all set!",
  doneText: "We'll send your photos to {email} tomorrow. If you can't find them, please check your spam folder.",
  again: 'Add another email',
};
export type Strings = typeof en;

export const STRINGS: Record<Lang, Strings> = {
  en,
  fi: {
    tour: 'Revontuliretki',
    title: 'Revontulikuvat sähköpostiisi',
    lead: 'Jätä sähköpostiosoitteesi, niin lähetämme sinulle kuvat tämän illan retkeltä.',
    group: 'Ryhmä',
    groupInput: 'Ryhmänumero',
    groupHelp: 'Kysy oppaalta, jos et ole varma.',
    email: 'Sähköpostiosoite',
    emailPlaceholder: 'nimi@esimerkki.fi',
    submit: 'Lähetä kuvat minulle',
    sending: 'Lähetetään…',
    privacy: 'Käytämme sähköpostiosoitettasi vain tämän retken kuvien lähettämiseen ja poistamme sen {days} päivän kuluessa.',
    privacyLink: 'Tietosuojaseloste',
    didYouMean: 'Tarkoititko {email}?',
    errEmail: 'Tarkista sähköpostiosoite.',
    errGroup: 'Kirjoita ryhmänumerosi.',
    errServer: 'Jokin meni vikaan. Yritä hetken päästä uudelleen.',
    doneTitle: 'Valmista!',
    doneText: 'Lähetämme kuvat huomenna osoitteeseen {email}. Jos et löydä niitä, katso myös roskapostikansio.',
    again: 'Lisää toinen osoite',
  },
  de: {
    tour: 'Nordlicht-Tour',
    title: 'Ihre Nordlicht-Fotos',
    lead: 'Hinterlassen Sie Ihre E-Mail-Adresse und wir schicken Ihnen die Fotos der heutigen Tour.',
    group: 'Gruppe',
    groupInput: 'Gruppennummer',
    groupHelp: 'Fragen Sie Ihren Guide, wenn Sie unsicher sind.',
    email: 'E-Mail-Adresse',
    emailPlaceholder: 'name@beispiel.de',
    submit: 'Fotos zusenden',
    sending: 'Wird gesendet…',
    privacy: 'Wir verwenden Ihre E-Mail-Adresse nur, um Ihnen die Fotos dieser Tour zu senden, und löschen sie innerhalb von {days} Tagen.',
    privacyLink: 'Datenschutzerklärung',
    didYouMean: 'Meinten Sie {email}?',
    errEmail: 'Bitte überprüfen Sie Ihre E-Mail-Adresse.',
    errGroup: 'Bitte geben Sie Ihre Gruppennummer ein.',
    errServer: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.',
    doneTitle: 'Alles erledigt!',
    doneText: 'Wir senden Ihre Fotos morgen an {email}. Falls Sie sie nicht finden, schauen Sie bitte auch im Spam-Ordner nach.',
    again: 'Weitere E-Mail-Adresse hinzufügen',
  },
  fr: {
    tour: 'Excursion aurores boréales',
    title: "Vos photos d'aurores boréales",
    lead: "Laissez votre adresse e-mail et nous vous enverrons les photos de l'excursion de ce soir.",
    group: 'Groupe',
    groupInput: 'Numéro de groupe',
    groupHelp: 'Demandez à votre guide en cas de doute.',
    email: 'Adresse e-mail',
    emailPlaceholder: 'nom@exemple.fr',
    submit: 'Recevoir mes photos',
    sending: 'Envoi…',
    privacy: 'Nous utilisons votre adresse e-mail uniquement pour vous envoyer les photos de cette excursion et la supprimons sous {days} jours.',
    privacyLink: 'Politique de confidentialité',
    didYouMean: 'Vouliez-vous dire {email} ?',
    errEmail: 'Veuillez vérifier votre adresse e-mail.',
    errGroup: 'Veuillez saisir votre numéro de groupe.',
    errServer: "Une erreur s'est produite. Veuillez réessayer dans un instant.",
    doneTitle: "C'est noté !",
    doneText: 'Nous enverrons vos photos demain à {email}. Si vous ne les trouvez pas, vérifiez aussi vos courriers indésirables.',
    again: 'Ajouter une autre adresse',
  },
  es: {
    tour: 'Excursión de auroras boreales',
    title: 'Tus fotos de la aurora boreal',
    lead: 'Déjanos tu correo electrónico y te enviaremos las fotos de la excursión de esta noche.',
    group: 'Grupo',
    groupInput: 'Número de grupo',
    groupHelp: 'Pregunta a tu guía si no estás seguro.',
    email: 'Correo electrónico',
    emailPlaceholder: 'nombre@ejemplo.com',
    submit: 'Enviarme las fotos',
    sending: 'Enviando…',
    privacy: 'Usamos tu correo solo para enviarte las fotos de esta excursión y lo eliminamos en un plazo de {days} días.',
    privacyLink: 'Política de privacidad',
    didYouMean: '¿Quisiste decir {email}?',
    errEmail: 'Revisa tu dirección de correo.',
    errGroup: 'Escribe tu número de grupo.',
    errServer: 'Algo salió mal. Inténtalo de nuevo en un momento.',
    doneTitle: '¡Listo!',
    doneText: 'Mañana te enviaremos las fotos a {email}. Si no las encuentras, revisa también la carpeta de spam.',
    again: 'Añadir otro correo',
  },
  it: {
    tour: "Tour dell'aurora boreale",
    title: "Le tue foto dell'aurora boreale",
    lead: 'Lasciaci la tua email e ti invieremo le foto del tour di stasera.',
    group: 'Gruppo',
    groupInput: 'Numero del gruppo',
    groupHelp: 'Chiedi alla tua guida se non sei sicuro.',
    email: 'Indirizzo email',
    emailPlaceholder: 'nome@esempio.it',
    submit: 'Inviami le foto',
    sending: 'Invio in corso…',
    privacy: 'Usiamo la tua email solo per inviarti le foto di questo tour e la cancelliamo entro {days} giorni.',
    privacyLink: 'Informativa sulla privacy',
    didYouMean: 'Intendevi {email}?',
    errEmail: 'Controlla il tuo indirizzo email.',
    errGroup: 'Inserisci il numero del tuo gruppo.',
    errServer: 'Qualcosa è andato storto. Riprova tra un momento.',
    doneTitle: 'Tutto fatto!',
    doneText: 'Domani invieremo le foto a {email}. Se non le trovi, controlla anche la cartella spam.',
    again: "Aggiungi un'altra email",
  },
  zh: {
    tour: '极光之旅',
    title: '领取您的极光照片',
    lead: '留下您的电子邮箱，我们会把今晚行程的照片发送给您。',
    group: '团组',
    groupInput: '团组编号',
    groupHelp: '如不确定，请询问您的导游。',
    email: '电子邮箱',
    emailPlaceholder: 'name@example.com',
    submit: '把照片发给我',
    sending: '正在提交…',
    privacy: '您的邮箱仅用于发送本次行程的照片，我们会在 {days} 天内将其删除。',
    privacyLink: '隐私政策',
    didYouMean: '您是想输入 {email} 吗？',
    errEmail: '请检查您的邮箱地址。',
    errGroup: '请输入您的团组编号。',
    errServer: '出了点问题，请稍后再试。',
    doneTitle: '提交成功！',
    doneText: '我们将于明天把照片发送至 {email}。如果没有收到，请查看垃圾邮件文件夹。',
    again: '添加其他邮箱',
  },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Picks the best supported language from an Accept-Language header. */
export function detectLang(acceptLanguage: string | null | undefined): Lang {
  if (!acceptLanguage) return 'en';
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { base: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { base } of ranked) if (isLang(base)) return base;
  return 'en';
}

export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
