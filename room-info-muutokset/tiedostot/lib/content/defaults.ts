import type { Content, RoomSlug } from "./types";

// Lähteet (etusija uusimmalle):
// 1. Eerikin toteutusohje SkyView_Room_Info_Verkkosivuleiska 6.10.2026 (King Igloo)
// 2. SkyView Trade Brochure Winter 2027–28 (huonekoot, henkilömäärät)
// 3. North Suites -villasivu + pohjapiirros (Aurora Cabin)
// 4. Puisto Oy:n room-info-luonnos 1.10.2026 (keittiö, minimarket, Wolt, ravintolavinkit, taksi)
// `check`-kentät näkyvät vain hallinnassa: ne kertovat, mikä on vielä vahvistamatta.

const IGLOOS: RoomSlug[] = ["king", "suite"];
const ALL: RoomSlug[] = ["king", "suite", "aurora-cabin"];
const CABIN: RoomSlug[] = ["aurora-cabin"];

export const defaults: Content = {
  settings: {
    receptionCall: "+358 20 767 1010",
    whatsapp: "+358 40 130 5588",
    receptionHours: "24 hours",
    wifiNetwork: "SkyView Guest",
    wifiPassword: "12345678",
    checkIn: "16:00",
    checkOut: "12:00",
    breakfastHours: "07:00–11:00",
    breakfastPrice: 39,
    breakfastWindow: "08:00–08:30",
    breakfastCutoff: "18:00",
    auraHours: "17:00–23:00",
    auraFrom: "17:00",
    auraTo: "23:00",
    lightsOff: "21:30",
    quietHours: "23:00–07:00",
    auraPhone: "+358 40 661 2146",
    cultaPhone: "+358 40 661 2537",
    safariPhone: "+358 40 661 2117",
    auraUrl: "https://skyviewigloos.com/restaurant-aura/",
    auraBookingUrl: "https://booking.resdiary.com/widget/Standard/Aura/71120?culture=en-GB", // AURA IN-HOUSE -kalenteri (hotellivieraat); julkinen = 70441
    cultaUrl: "https://skyviewigloos.com/arctic-spa-culta/",
    appIos: "https://apps.apple.com/app/northern-lights-alert/id1133418799", // Modeleon (sama kuin Android), todennettu 6.10.2026
    appAndroid: "https://play.google.com/store/apps/details?id=com.modeleon.northernlightsalert",
    address: "Olleronvaarantie 66, 96100 Rovaniemi, Finland",
    notice: "",
    noticeTone: "info",
    rideRooms: ALL, // Karl 6.10.2026: resort ride kaikille huonetyypeille
    checks: {
    },
  },

  rooms: [
    {
      slug: "king",
      name: "King Igloo",
      official: "Signature Igloo Suite King",
      noun: "igloo",
      title: "Your King Igloo.",
      intro: "Everything you need for your stay, with our team always close at hand.",
      facts: "60 m² · two floors · up to 5 guests",
      heroImage: "/images/king-hero.webp",
      cardImage: "/images/king-hero-sm.webp",
    },
    {
      slug: "suite",
      name: "Igloo Suite",
      official: "Signature Igloo Suite",
      noun: "igloo",
      title: "Your Igloo Suite.",
      intro: "Everything you need for your stay, with our team always close at hand.",
      facts: "50 m² · two floors · up to 5 guests",
      heroImage: "/images/suite-hero.webp",
      cardImage: "/images/glass-suite-sm.webp",
    },
    {
      slug: "aurora-cabin",
      name: "Aurora Cabin",
      official: "Aurora Cabin",
      noun: "cabin",
      title: "Your Aurora Cabin.",
      intro: "Everything you need for your stay, with our team always close at hand.",
      facts: "25 m² · up to 2 guests · private sauna & terrace hot tub", // Karl 8.10.2026: 2 hlö (aiempi 4 korjattu)
      heroImage: "/images/cabin-hero.webp",
      cardImage: "/images/cabin-hero-sm.webp",
      floorPlan: "/images/cabin-floorplan.png",
      // Kuvat North Suitesin villasivulta (havainnekuvia, Karlin valinta 6.10.2026)
      check: "Kuvat ovat North Suitesin havainnekuvia – vaihda valokuviin kun saatavilla.",
    },
  ],

  sections: [
    {
      id: "dining",
      kind: "cards",
      nav: "Breakfast & dining",
      eyebrow: "Eat & drink",
      title: "A good morning.\nA memorable evening.",
      rooms: ALL,
      visible: true,
      items: [
        {
          id: "breakfast",
          eyebrow: "Included in your stay",
          title: "Breakfast at AURA",
          meta: "{{breakfastHours}}",
          metaNote: "every morning",
          body: "Enjoy our breakfast buffet at Restaurant AURA. Breakfast is included in your room price.",
        },
        {
          id: "breakfast-delivery",
          eyebrow: "On request",
          title: "Breakfast in your {{room}}",
          body:
            "Prefer a slow morning? Breakfast delivery is available for €{{breakfastPrice}} per person, delivered between {{breakfastWindow}}.\n\nPlease request delivery before {{breakfastCutoff}} the evening before and let us know about allergies and dietary requirements. Your order is confirmed when our team replies.",
          actions: [{ kind: "request", request: "breakfast", label: "Request breakfast delivery" }],
        },
        {
          id: "aura",
          eyebrow: "Restaurant AURA",
          title: "An evening at AURA",
          meta: "{{auraHours}}",
          metaNote: "dinner",
          body: "Discover northern flavours with an Asian influence, created in collaboration with Finnish chef Tomi Björck.",
          actions: [
            { kind: "embed", href: "{{auraBookingUrl}}", label: "Book a table" },
            { kind: "link", href: "{{auraUrl}}", label: "Menus & restaurant information" },
            { kind: "call", phone: "{{auraPhone}}", label: "Call AURA" },
          ],
        },
        {
          id: "in-room",
          eyebrow: "In your {{room}}",
          title: "Drinks & the micro market",
          body:
            "Milk, coffee and sparkling wine in your {{room}} are complimentary.\n\nThe micro market at reception has snacks, sweets and drinks for purchase. You can also order food from restaurants and supermarkets with the Wolt app.",
        },
      ],
    },
    { id: "programme", kind: "programme", nav: "Free weekly programme", eyebrow: "", title: "", items: [], rooms: ALL, visible: true },
    {
      id: "your-igloo",
      kind: "accordion",
      nav: "Your igloo",
      eyebrow: "Your private space",
      title: "Settle into your igloo.",
      intro: "Your glass-roof bedroom, private sauna and outdoor hot tub are yours to enjoy throughout your stay.",
      rooms: IGLOOS,
      visible: true,
      items: [
        {
          id: "sauna",
          title: "Your private sauna",
          body:
            "Use the sauna control panel to switch the heater on. The sauna takes around 20 minutes to warm up. Keep the sauna door closed while it warms up and during use.\n\nPlease switch the heater off when you have finished – it also turns off automatically after 2 hours. Our reception team can help you with the controls at any time.\n\nPlease note: the window heating does not work while the sauna is on.", // Karl 13.10.2026
          actions: [{ kind: "whatsapp", label: "Ask for help with the sauna", text: "Hi! Could you help me with the sauna in my igloo?" }],
        },
        {
          id: "hot-tub",
          title: "Your private hot tub",
          body:
            "Your hot tub is kept warm and ready for use. Please shower before entering and do not use shampoo or body wash in the water.\n\nRemove snow from the cover before opening it. If you need help with the cover or controls, please contact reception.",
          actions: [{ kind: "whatsapp", label: "Ask for help with the hot tub", text: "Hi! Could you help me with the hot tub in my igloo?" }],
        },
        {
          id: "heating",
          title: "Heating, windows & lighting",
          body:
            "The floors are heated. Window heating helps clear the glass for a better view of the sky; please allow a little time for the windows to clear.\n\nPlease note: the window heating does not work while the sauna is on.\n\nIf the room feels too warm or cool, or you need help with the lights, our reception team is happy to help.",
          actions: [{ kind: "whatsapp", label: "Get help with room controls", text: "Hi! Could you help me with the room controls in my igloo?" }],
        },
        {
          id: "kitchen",
          title: "Kitchen",
          body: "Your igloo kitchen has a kettle, coffee maker, refrigerator, toaster and microwave.\n\nA hot plate and an air fryer are available on request – just ask reception.", // Karl 13.10.2026: ei vakiovarusteena, saa pyynnöstä
        },
        {
          id: "housekeeping",
          title: "Housekeeping & towels",
          body:
            "Daily housekeeping takes place between 11:00 and 16:00. Please contact reception if you would prefer to skip cleaning.\n\nTowels left on the floor will be replaced. Towels left on hooks will be kept for your continued use.",
          actions: [{ kind: "whatsapp", label: "Contact housekeeping", text: "Hi! A message for housekeeping:" }],
        },
        {
          id: "wifi",
          title: "Wi-Fi",
          body: "Network: {{wifiNetwork}}\nPassword: {{wifiPassword}}",
          actions: [{ kind: "wifi", label: "Copy Wi-Fi password" }],
        },
        {
          id: "water",
          title: "Drinking water",
          body: "Tap water in Finland is exceptionally clean and safe to drink. Enjoy!",
        },
      ],
      check:
        "Eerik: lisää myöhemmin hyväksytyt kuvat ja täsmäohjeet King-iglun säätimistä. Saunan 20 min / 2 h -tiedot Puiston PDF:stä. Keittiövarustus Puiston PDF:stä – koskeeko sekä Suitea että Kingiä?",
    },
    {
      id: "your-cabin",
      kind: "accordion",
      nav: "Your cabin",
      eyebrow: "Your private space",
      title: "Settle into your cabin.",
      intro: "Your private sauna, terrace hot tub and panoramic forest view are yours to enjoy throughout your stay.",
      rooms: CABIN,
      visible: true,
      items: [
        {
          id: "sauna",
          title: "Your private sauna",
          body:
            "Use the sauna control panel to switch the heater on. The sauna takes around 20 minutes to warm up. Keep the sauna door closed while it warms up and during use.\n\nPlease switch the heater off when you have finished – it also turns off automatically after 2 hours.",
          actions: [{ kind: "whatsapp", label: "Ask for help with the sauna", text: "Hi! Could you help me with the sauna in my cabin?" }],
        },
        {
          id: "hot-tub",
          title: "Your terrace hot tub",
          body:
            "The hot tub on your terrace is kept warm and ready for use – a perfect spot for the northern lights or a starry sky. Please shower before entering and do not use shampoo or body wash in the water.\n\nRemove snow from the cover before opening it. If you need help with the cover or controls, please contact reception.",
          actions: [{ kind: "whatsapp", label: "Ask for help with the hot tub", text: "Hi! Could you help me with the hot tub at my cabin?" }],
        },
        {
          id: "heating",
          title: "Heating & ventilation",
          body:
            "Your cabin has electric underfloor heating and an air-source heat pump for extra warmth. Ventilation with heat recovery keeps the air fresh.\n\nIf the cabin feels too warm or cool, our reception team is happy to help.",
          actions: [{ kind: "whatsapp", label: "Get help with room controls", text: "Hi! Could you help me with the heating in my cabin?" }],
        },
        {
          id: "kitchen",
          title: "Kitchen",
          body: "Your cabin has a fully equipped kitchenette with integrated appliances.",
        },
        {
          id: "storage",
          title: "Ski storage, parking & EV charging",
          body:
            "Next to your entrance is a lockable outdoor storage room for skis, snowboards and winter gear.\n\nEach cabin has one parking space with an electric vehicle charging point. Ask reception if you need help with charging.",
        },
        {
          id: "housekeeping",
          title: "Housekeeping & towels",
          body:
            "Daily housekeeping takes place between 11:00 and 16:00. Please contact reception if you would prefer to skip cleaning.\n\nTowels left on the floor will be replaced. Towels left on hooks will be kept for your continued use.",
          actions: [{ kind: "whatsapp", label: "Contact housekeeping", text: "Hi! A message for housekeeping:" }],
        },
        {
          id: "wifi",
          title: "Wi-Fi",
          body: "Network: {{wifiNetwork}}\nPassword: {{wifiPassword}}",
          actions: [{ kind: "wifi", label: "Copy Wi-Fi password" }],
        },
        {
          id: "water",
          title: "Drinking water",
          body: "Tap water in Finland is exceptionally clean and safe to drink. Enjoy!",
        },
      ],
      check:
        "Cabin-tiedot North Suitesin sivulta + pohjapiirroksesta. Vahvista: keittiön laitteet, varaston lukitus, latauspisteen käyttö, siivousajat ja onko lämmitys/sauna samat ohjeet kuin igluissa.",
    },
    {
      id: "culta",
      kind: "feature",
      nav: "Culta Spa",
      eyebrow: "Arctic Spa Culta · additional experience",
      title: "A little more time\nto unwind.",
      image: "", // Karl 7.10.: ei kuvaa, pelkkä vihreä laatikko (kuvat varalla: /images/culta.webp, culta-pool-aurora.webp)
      rooms: ALL,
      visible: true,
      items: [
        {
          id: "culta",
          title: "Arctic Spa Culta",
          body:
            "Enjoy Lapland's only heated rooftop infinity pool and the panoramic Finnish sauna at Arctic Spa Culta. Spa visits are an additional paid service unless included in your booking or package. Check your booking confirmation or ask reception before reserving.\n\nBathrobes, towels and slippers are provided at the spa. Culta is a shared spa limited to sixteen guests at a time; your {{room}}'s sauna and hot tub remain your own private wellness space.",
          actions: [
            { kind: "link", href: "{{cultaUrl}}", label: "Spa details & booking information" },
            { kind: "request", request: "culta", label: "Ask reception to book" },
            { kind: "call", phone: "{{cultaPhone}}", label: "Call CULTA" },
          ],
        },
      ],
      footnote: "You can also arrange your visit at reception, the Safari House or directly with the spa.",
      // Bokun-liput (Sky View Igloo Resort, todennettu 6.10.2026)
      bokunProducts: [
        // Sama group → naisten ja miesten liput samaan koriin, yksi maksu
        { bokunId: "1295332", label: "Women", group: "Spa session", note: "Shared spa · book women's and men's tickets together" },
        { bokunId: "1294555", label: "Men", group: "Spa session" },
        { bokunId: "1295345", label: "Private spa", note: "The whole spa for up to 16 guests", exclusive: true },
      ],
    },
    { id: "activities", kind: "activities", nav: "Safaris", eyebrow: "", title: "", items: [], rooms: ALL, visible: true },
    {
      id: "northern-lights",
      kind: "aurora",
      nav: "Northern lights",
      eyebrow: "Northern lights",
      title: "Let the sky surprise you.",
      image: "/images/drone-night.webp",
      rooms: ALL,
      visible: true,
      items: [
        {
          id: "app",
          title: "Northern lights alerts",
          body:
            "We recommend the Northern Lights Alert app – it lets you know when there is a good chance of seeing the aurora.\n\nAsk our reception team for more tips on where and when to look.",
          actions: [
            { kind: "link", href: "{{appIos}}", label: "App Store" },
            { kind: "link", href: "{{appAndroid}}", label: "Google Play" },
            { kind: "whatsapp", label: "Ask reception about the northern lights", text: "Hi! Could you give me some tips for seeing the northern lights?" },
          ],
        },
        {
          id: "lights",
          title: "Lights down. Look up.",
          meta: "{{lightsOff}}",
          body:
            "Outdoor lights are switched off from {{lightsOff}} for better Northern Lights viewing.\n\nQuiet hours are {{quietHours}}. Please keep noise to a minimum and respect the privacy of neighbouring guests.",
        },
      ],
      // Karl 13.10.2026: oma revontulihälytin (Aurora outlook + Notify me) piilotettu vierailta;
      // tilalle sovellussuositus + "kysy respalta". Taustakoodi (lib/aurora*, /api/aurora) jätetty.
    },
    {
      id: "help",
      kind: "help",
      nav: "Useful information",
      eyebrow: "Here to help",
      title: "A message away.\nAt any hour.",
      rooms: ALL,
      visible: true,
      items: [
        {
          id: "checkin",
          title: "Check-in & check-out",
          body: "Check-in is from {{checkIn}}. Check-out is by {{checkOut}}.\n\nPlease contact reception for assistance with your departure.",
        },
        {
          id: "ride",
          title: "Resort ride",
          body:
            "Heading to dinner at AURA, the spa or the Safari House? Our team can pick you up from your {{room}}. Let us know the time, where you would like to go and how many of you are travelling.",
          actions: [{ kind: "request", request: "ride", label: "Request a ride" }],
        },
        {
          id: "taxi",
          title: "Taxis & airport transfers",
          body:
            "We work with Taksi Rovaniemi. You can book a taxi yourself online, or our reception team can book it for you in advance – including airport transfers. Let us know your preferred time, destination, number of passengers and luggage.\n\nFor an immediate pickup, please call reception.",
          actions: [
            // Taksi Rovaniemi (yhteistyö kaudesta 2026–27): vieraan oma varauslinkki
            { kind: "link", href: "https://eb3.autocab.net/#/32327001", label: "Book a Taksi Rovaniemi taxi" },
            { kind: "request", request: "taxi", label: "Ask reception to book" },
            { kind: "call", phone: "{{receptionCall}}", label: "Call reception" },
          ],
        },
        {
          id: "contacts",
          title: "Resort contacts & directions",
          body:
            "SkyView main number {{receptionCall}}\nSafari House {{safariPhone}}\nRestaurant AURA {{auraPhone}}\nArctic Spa CULTA {{cultaPhone}}\n\nSkyView Igloo Resort · {{address}}",
          actions: [{ kind: "whatsapp", label: "Ask reception for directions", text: "Hi! Could you give me directions to:" }],
        },
        {
          id: "nearby",
          title: "Around Rovaniemi",
          body:
            "Restaurant tips in the city centre: Gustav, Arctic Restaurant, Nili, Roka, Monte Rosa, Pure Pizza & Pure Burger and Hanki.\n\nLapland Winter Park offers ice skating, cross-country skiing, sledding, snowmobiling and more, with a free shuttle bus from SkyView. Ask reception for the timetable.",
        },
        {
          id: "safety",
          title: "Smoking policy & emergencies",
          body:
            "We follow a no-smoking policy throughout our premises.\n\nIn an emergency, call 112. Our address is {{address}}. Give your {{room}} number when asking for help.",
          actions: [{ kind: "call", phone: "112", label: "Call 112" }],
        },
      ],
      check: "Ravintolavinkit ja Lapland Winter Park (ilmainen bussi) Puiston PDF:stä – Eerikin ohjeessa ei. Vahvista ajantasaisuus.",
    },
  ],

  programme: {
    eyebrow: "Complimentary experiences",
    title: "A little more Lapland.\nIncluded in your stay.",
    intro: "Our weekly guest programme is included for SkyView guests in every room category.",
    noBooking: "No booking needed. All activities start at SkyView Safari House. Simply arrive at the scheduled time.",
    entries: [
      {
        id: "reindeer",
        days: "Monday & Thursday",
        daysShort: "Mon & Thu",
        time: "10:00–10:30",
        duration: "30 minutes",
        title: "Meet the Reindeer",
        body: "Meet and feed our reindeer, hear stories about life in Lapland and take photos to remember your visit.",
        location: "SkyView Safari House",
      },
      {
        id: "snowshoe",
        days: "Tuesday & Friday",
        daysShort: "Tue & Fri",
        time: "13:00–14:00",
        duration: "1 hour",
        title: "Snowshoe Walk",
        body: "A relaxed guided snowshoe walk in the surroundings of the resort, with time to enjoy the snowy scenery.",
        location: "SkyView Safari House",
      },
      {
        id: "aurora-camp",
        days: "Wednesday & Saturday",
        daysShort: "Wed & Sat",
        time: "20:30–22:30",
        duration: "2 hours",
        title: "Aurora Camp",
        body:
          "Spend an evening at the Aurora Kota with hot drinks, biscuits and Northern Lights stories from our aurora guide. A photographer is included free of charge.",
        location: "SkyView Safari House",
      },
    ],
    notes:
      "All times are Finland local time. Dress warmly and wear suitable winter footwear. Children must be accompanied by an adult.\n\nThe programme is subject to weather and snow conditions. Ask reception about any changes during your stay. Northern Lights sightings cannot be guaranteed.\n\nNo guided guest programme on Sundays. Enjoy the self-guided activities below.",
    selfGuided: {
      id: "self-guided",
      eyebrow: "At your own pace · complimentary",
      title: "Reindeer & time in the snow",
      body:
        "Visit our reindeer enclosure and enjoy the sledding hill throughout your stay. Follow the feeding instructions at the enclosure and ask our team where to find suitable reindeer feed and sleds.\n\nSnow activities depend on the conditions.",
      actions: [{ kind: "whatsapp", label: "Ask about self-guided activities", text: "Hi! I'd like to know more about the self-guided activities." }],
    },
    season: "16 Oct 2026 – 15 Apr 2027", // resortin talvikausi (Karl 7.10.2026)
    // Karl 13.10.2026: aktiviteetit vielä päättämättä → "Coming soon", kytketään pois hallinnasta.
    comingSoon: true,
    comingSoonText:
      "Our weekly guest programme for the winter season is being finalised and will be published here soon. Ask our reception team what's on during your stay.",
    rooms: ALL,
    visible: true,
  },

  activities: {
    eyebrow: "SkyView Safari House",
    title: "Step into the Arctic.",
    intro:
      "Northern Lights tours, husky and snowmobile safaris and reindeer experiences – departing from the SkyView Safari House. Book online or ask our team.",
    note: "These excursions are paid activities, separate from the complimentary guest programme.",
    // Bokun: Sky View Igloo Resort -toimittajan tuotteet (todennettu API:sta 6.10.2026).
    // Hinta, kesto, kuva ja vapaat lähdöt tulevat Bokunista; alla olevat ovat varalla.
    items: [
      {
        id: "northern-lights",
        title: "Northern Lights Pro – Unlimited Distance",
        body: "Our aurora guides follow the clearest skies as far as it takes, with photos of you under the lights.",
        duration: "8 hours",
        priceFrom: "€199",
        image: "/images/drone-dusk-sm.webp",
        bokunId: "1294560",
        rooms: ALL,
        visible: true,
      },
      {
        id: "husky",
        title: "Signature Husky Safari",
        body: "Meet the huskies and glide through the snowy forest behind an enthusiastic team.",
        duration: "4 hours",
        priceFrom: "€269",
        bokunId: "1294556",
        rooms: ALL,
        visible: true,
      },
      {
        id: "snowmobile",
        title: "Snowmobile Adventure",
        body: "Ride a snowmobile across the Arctic wilderness with an experienced guide.",
        duration: "2 hours 30 minutes",
        priceFrom: "€179",
        bokunId: "1295117",
        rooms: ALL,
        visible: true,
      },
      {
        id: "reindeer",
        title: "Exclusive Reindeer Experience",
        body: "A longer, guided visit with our reindeer and their herders – more time, more stories.",
        duration: "2 hours",
        priceFrom: "€169",
        bokunId: "1294558",
        rooms: ALL,
        visible: true,
      },
    ],
    rooms: ALL,
    visible: true,
  },
};
