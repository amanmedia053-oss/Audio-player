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

  about_telegram_label: 'ټلیګرام',
  about_whatsapp_label: 'واټساپ',
  about_facebook_label: 'فېسبوک',
  about_youtube_label: 'یوټیوب',
  about_email_label: 'برېښنالیک',
  about_code_badge_tooltip: 'کوډ جوړونکي',
  about_social_title: 'رسمي اړیکې او ټولنیزې شبکې',
  about_social_desc: 'زموږ د نوو خپرونو او ملاتړ لپاره په لاندې لارو اړیکه ونیسئ:',

  onboarding_btn_skip: 'تېرېدل (Skip)',
  onboarding_btn_prev: 'شاته',
  onboarding_btn_start: 'پيل کړئ (Get Started)',
  onboarding_btn_next: 'بل پړاو',

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

  list_search_placeholder: 'د متن له مخې پلټنه وکړئ...',
  list_search_clear: 'پاکول',
  list_total_label: 'ټول غږیز نشرات ({count})',
  list_no_results: 'هیڅ خپرونه ونه موندل شوه.',
  list_no_results_sub: 'بله کلمه وکاروئ یا پلټنه پاکه کړئ.',
  list_listened_label: 'اورېدل شوی',

  favorites_empty_desc: 'تاسو لا تر اوسه هیڅ غږیز ناول یا خپرونه خوښ کړی نه دی. په اصلي لیست کې د هر غږ تر څنګ د زړه (خوښې) په نښه باندې کلیک وکړئ ترڅو دلته اضافه شي.',
  favorites_empty_go_home: 'اصلي لیست ته ورشئ',
  favorites_search_placeholder: 'په خوښو شویو کې پلټنه...',
  sidebar_cover_url: sidebarCover,
  about_cover_url: aboutCover,
  creator_avatar_url: aboutProfile,
};
