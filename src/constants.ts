import { AppConfig } from './types';
import sidebarCover from './assets/app_images/sidebar_cover.svg';
import aboutCover from './assets/app_images/about_cover.svg';
import aboutProfile from './assets/app_images/about_profile.svg';

export const DEFAULT_APP_CONFIG: AppConfig = {
  tab_home: 'کور',
  tab_favorites: 'خوښې',
  tab_history: 'تاریخچه',
  tab_about: 'د چینل اړه',

  about_creator_name: 'عبيدالله غفاري',
  about_creator_role: 'د اپلیکیشن رسمي جوړونکی او پرمخ وړونکی',
  about_creator_sub: 'تخنیکي څانګه او ډیزاین بستر',
  about_intro_text: 'موږ د زړه له تله د پښتو ژبې او بډایه ادبیاتو مینه وال یو. د نوو ډیجیټل وسایلو او غږیزو ټیکنالوژیو په مرسته هڅه کوو چې د خپل ګران هېواد بډايه کلتوري ارزښتونه او غوره رنګین ناولونه د غږ په هنر کې ستاسو لاسونو ته درکړو. زموږ هدف د ادبیاتو چټک او اسانه لاسرسی، او د ځوان نسل پوهنه او هڅونه ده.',

  about_telegram_url: 'https://t.me/afghan_bandi',
  about_whatsapp_url: 'https://wa.me/93700000000',
  about_facebook_url: 'https://facebook.com/afghan_bandi',
  about_youtube_url: 'https://youtube.com/@afghan_bandi',
  about_email: 'islamicclips505@gmail.com',

  about_lib_title: 'د غږیز کتابتون په اړه',
  about_lib_points: [
    '• ټول کتابونه د خورا لوړ او غوره کیفیت لرونکي سټوډیویي غږ سره برابر شوي دي.',
    '• د اورېدو پر مهال ستاسو غږیزه تاریخچه په چټکۍ سره ستاسو په هماغه برخه کې ثبتېږي ترڅو بل ځل د پاتې ځای څخه پیل کړئ.',
    '• تاسو کولی شئ د اورېدو سرعت د خپلې خوښې سره د (0.5x تر 2x) پورې تنظیم کړئ.'
  ],

  onboarding_step1_badge: 'هرکلی او پېژندنه',
  onboarding_step1_title: 'غږیزې نړۍ ته ښه راغلاست! 🎧',
  onboarding_step1_desc: 'رسمي غږیز کتابتون ته هرکله راشئ. دلته به تاسو د پښتو غوره ناولونو، په زړه پورې لنډو کیسو او غږیزو مقالو بډایه ټولګه په وړیا او لوړ کیفیت غږ سره ترلاسه کړئ.',

  onboarding_step2_badge: 'سمارټ او افلاین غږول',
  onboarding_step2_title: 'خپل پرمختګ خوندي او تعقیب کړئ 💾',
  onboarding_step2_desc: 'ستاسو د اورېدو پرمختګ په اوتومات ډول ثبت کېږي ترڅو هر غږیز اثر بیا له هماغه ځای څخه پيل کړئ. همداراز په افلاین حالت کې هم کولای شئ پخوانۍ پرانیستل شوې کیسې بې له انټرنیټه واورئ.',

  onboarding_step3_badge: 'خوښ شوي غږونه',
  onboarding_step3_title: 'خوښ شوي اثار او بډایه کڅوړه ❤️',
  onboarding_step3_desc: 'هغه فصلونه او ناولونه چې ستاسو زیات خوښېږي، په اسانۍ سره نښه کړئ او د خوښو غږونو په کڅوړه کې یې وساتئ ترڅو په هر وخت کې ورته ژر او چټک لاسرسی ولرئ.',

  // Additional customizable UI texts
  about_telegram_label: 'ټلیګرام',
  about_whatsapp_label: 'واټساپ',
  about_facebook_label: 'فېسبوک',
  about_youtube_label: 'یوټیوب',
  about_email_label: 'برېښنالیک',
  about_code_badge_tooltip: 'کوډ جوړونکي',
  about_social_title: 'رسمي اړیکې او ټولنیزې شبکې',
  about_social_desc: 'زموږ د نوو خپرونو او ملاتړ لپاره په لاندې لارو اړیکه ونیسئ:',

  // Onboarding controls
  onboarding_btn_skip: 'تېرېدل (Skip)',
  onboarding_btn_prev: 'شاته',
  onboarding_btn_start: 'پيل کړئ (Get Started)',
  onboarding_btn_next: 'بل پړاو',

  // Player controls & titles
  player_title_prev: 'مخکینی',
  player_title_next: 'بل',
  player_title_expand: 'پراخ کړئ',
  player_title_dismiss: 'بندول',
  player_title_close: 'تړل',
  player_now_playing: 'اوس مهال غږول کېږي',
  player_audio_genre: 'پښتو ناول',
  player_audio_genre_en: 'AUDIO NOVEL',
  player_tooltip_prev: 'مخکینی فصل واورئ',
  player_tooltip_rewind: '۱۵ ثانیې شاته تلل',
  player_tooltip_forward: '۱۵ ثانیې مخکې تلل',
  player_tooltip_next: 'بل فصل واورئ',
  player_speed_label: 'سرعت: {speed}x',
  player_speed_title: 'د غږ سرعت ټاکل',
  player_speed_normal: '1.0x (عادي)',
  player_footer_note: 'د پاڼې پاڼې غږیز ملګري سره د اورېدو بې ساري خوند واخلئ',

  // Feed/Home list
  list_search_placeholder: 'د متن له مخې پلټنه وکړئ...',
  list_search_clear: 'پاکول',
  list_total_label: 'ټول غږیز نشرات ({count})',
  list_no_results: 'هیڅ خپرونه ونه موندل شوه.',
  list_no_results_sub: 'بله کلمه وکاروئ یا پلټنه پاکه کړئ.',
  list_listened_label: 'اورېدل شوی: {percent}%',
  list_fav_remove_tooltip: 'خوښې مینو څخه لرې کول',
  list_fav_add_tooltip: 'خوښو شویو کې شاملول',

  // Toolbar
  toolbar_menu_tooltip: 'مینو',
  toolbar_more_tooltip: 'نور غوراوي',
  toolbar_quick_options: 'چټک غوراوي',
  toolbar_share_copy: 'شریکول او کاپي',
  toolbar_telegram_channel: 'رسمي ټلیګرام چینل',
  toolbar_info: 'د چینل او سیسټم معلومات',

  // Offline banner & General errors
  app_offline_desc: 'تاسو په افلاین حالت کې یاست. خلاصې شوې خپرونې د اورېدو وړ دي.',
  app_offline_badge: 'افلاین حالت',
  app_error_title: 'پیوستون تېروتنه!',

  // Continue Row
  continue_badge_label: 'بېرته یې اورئ (پاتې برخه واورئ)',
  continue_remaining_label: '{time} پاتې دي ({percent}%)',
  continue_clear_tooltip: 'د پرمختګ پاکول',
  continue_resume_btn: 'پیل کړئ',

  // History Tab
  history_stats_title: 'ستاسو غږیز سفر',
  history_stats_mins: '{mins} دقیقې اورېدل شوی',
  history_stats_chapters: 'په ټولیز ډول د {count} فصلونو څخه',
  history_heading: 'وروستي پیل شوي غږونه',
  history_clear_all_btn: 'ټول پاک کړئ',
  history_no_history: 'تر اوسه هیڅ تاریخچه نشته.',
  history_no_history_sub: 'د کور پاڼې څخه کوم ناول غږیز فصل پیل کړئ.',
  history_play_tooltip: 'بیا اورېدل پیل کړئ',
  history_delete_tooltip: 'له تاریخچې پاکول',

  // Favorites Tab
  favorites_clear_all: 'ټول پاکول',
  favorites_heading: 'زما خوښې خپرونې ({count})',
  favorites_empty_title: 'خوښې خپرونې شتون نه لري',
  favorites_empty_desc: 'تاسو لا تر اوسه هیڅ غږیز ناول یا خپرونه خوښ کړی نه دی. په اصلي لیست کې د هر غږ تر څنګ د زړه (خوښې) په نښه باندې کلیک وکړئ ترڅو دلته اضافه شي.',
  favorites_empty_go_home: 'اصلي لیست ته ورشئ',
  favorites_search_placeholder: 'په خوښو شویو کې پلټنه...',
  sidebar_cover_url: sidebarCover,
  about_cover_url: aboutCover,
  creator_avatar_url: aboutProfile,
};

export const FALLBACK_CHANNEL_INFO = {
  name: "افغان بانډي (رسمي غږیز کتابتون)",
  description: "د افغان بانډي د غږیز سټوډیو څخه د غوره پښتو کیسو، پند لرونکو روایتونو او تاریخي رنګینو ناولونو عالي ټولګه.",
  avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
};

export const FALLBACK_POSTS = [
  {
    id: "afg-config",
    text: JSON.stringify({
      tab_home: 'اصلي پاڼه',
      about_creator_name: 'عبيدالله غفاري',
      about_creator_role: 'د افغان بانډي غږیز کتابتون رسمي لوستونکی او پرمخ وړونکی',
      about_intro_text: 'موږ د زړه له کومې ستاسو لپاره د پښتو ادبیاتو په تېره بیا د لنډو کیسو، پند لرونکو داستانونو او غوره تاریخي ناولونو د ثبتولو هڅه کوو. زموږ موخه پښتو غږیزو کتابونو ته د چټک او لوړ کیفیت لاسرسی دی.',
      onboarding_step1_badge: 'بې ساري هرکلى',
      onboarding_step1_title: 'رسمي غږیز کتابتون ته ښه راغلاست! 🎧',
      onboarding_step1_desc: 'دلته به تاسو د پښتو غوره ناولونه او غږیز داستانونه په عالي او رنګین سټوډیویي غږ سره ومومئ.',
      onboarding_step2_badge: 'سمارټ افلاین ثبتونه',
      onboarding_step2_title: 'ستاسو د اورېدو پرمختګ خوندي کېږي 💾',
      onboarding_step2_desc: 'ستاسو د اورېدو پروسه په اوتومات ډول په هر ګام کې ثبتیږي نو په اسانۍ سره یې د پاتې برخې څخه پیلولی شئ.',
      onboarding_step3_badge: 'خوښ شوي ناولونه',
      onboarding_step3_title: 'زما د خوښو کڅوړه ❤️',
      onboarding_step3_desc: 'کوم فصلونه چې ستاسو ډېر خوښېږي په نښه کړئ ترڅو په هر وخت کې ورته اسانه او ګړندی لاسرسی ولرئ.'
    }, null, 2),
    audio_url: "",
    duration: "0:00",
    date: "2026-07-17T12:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop"
    ]
  },
  {
    id: "afg-1",
    text: "د افغان بانډي غږیز ناول - د مستانه او همراز د جلاوطنۍ داستان: لومړی څپرکی - په دې برخه کې د دوو مینو زړونو ناڅاپي بېلتون او د کلي په رنګین ماښام کې د وروستي لید کاته جزییات واورئ.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "12:15",
    date: "2026-07-16T12:00:00Z"
  },
  {
    id: "afg-2",
    text: "د افغان بانډي غږیز ناول - د غره په لمنو کې د سولې غږ: دویم څپرکی - په دې غږیزه برخه کې د کوچي احمد د خیمو او مېړانې داستان راسپړل کېږي چې څنګه یې خپل ایل د سختو توپانونو څخه وژغوره.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "14:40",
    date: "2026-07-16T11:30:00Z"
  },
  {
    id: "afg-3",
    text: "د افغان بانډي غږیز ناول - د پټو اوښکو مینه: درېیم څپرکی - د یوې مینه ناکې نجلۍ د زړه درد او په تور تيارو شپو کې د خپل تري تم شوي همسفر د راستنېدو په هيله د دعاګانو او ډاډ زړه راښکونکی غږ.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "09:55",
    date: "2026-07-16T11:00:00Z"
  },
  {
    id: "afg-4",
    text: "د افغان بانډي غږیز ناول - د کاروان زنګونه او د هجران ویر: څلورم څپرکی - د پېښور او کابل ترمنځ د زړو موټرو په اوږده سفر کې د زړونو د تبادلې او د ژوند د نویو ملګرتیاوو پيل.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "11:22",
    date: "2026-07-16T10:30:00Z"
  },
  {
    id: "afg-5",
    text: "د افغان بانډي غږیز ناول - د سپېده داغ رڼا او د کلي اختر: پنځم څپرکی - وروسته له اوږدو کلونو څخه د ټولو جلا شوو دوستانو بېرته یوځای کېدل او د نوي پښتون نسل د بریالیتوب غږیز تمثیل.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "16:05",
    date: "2026-07-16T10:00:00Z"
  },
  {
    id: "afg-6",
    text: "د افغان بانډي غږیز ناول - د برخلیک کرښې: شپږم څپرکی - د دې په زړه پورې غږیز ناول وروستۍ برخه، چې پکې د زړونو مینه رښتینې کچې ته رسېږي او د نوې هیلې څرک روښانه کېږي.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: "15:18",
    date: "2026-07-16T09:30:00Z"
  }
];

