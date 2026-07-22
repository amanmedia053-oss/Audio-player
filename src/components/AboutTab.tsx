import React from 'react';
import { motion } from 'motion/react';
import { ChannelInfo, AppConfig } from '../types';
import { getApiUrl } from '../utils';
import {
  Send,
  Mail,
  Facebook,
  Youtube,
  MessageSquare,
  Heart,
  Sparkles,
  BookOpen,
  Code,
  RefreshCw,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Copy,
  Check,
  Activity,
  Wifi,
  WifiOff,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface AboutTabProps {
  channelInfo: ChannelInfo | null;
  appConfig: AppConfig;
}

export const AboutTab: React.FC<AboutTabProps> = ({ channelInfo, appConfig }) => {
  const defaultBackend = 'https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';
  const [serverUrl, setServerUrl] = React.useState(() => {
    try {
      const stored = localStorage.getItem('pashto_novel_backend_url');
      if (stored && (stored.includes('localhost') || stored.includes('ais-pre-'))) {
        localStorage.removeItem('pashto_novel_backend_url');
        return defaultBackend;
      }
      return stored || defaultBackend;
    } catch (e) {
      return defaultBackend;
    }
  });
  const [saveStatus, setSaveStatus] = React.useState('');

  // Bandi Fetch States
  const [fetching, setFetching] = React.useState(false);
  const [fetchResult, setFetchResult] = React.useState<any>(null);
  const [forceScrape, setForceScrape] = React.useState(true);
  const [customChannel, setCustomChannel] = React.useState('afghan_bandi');
  const [fetchLogsLocal, setFetchLogsLocal] = React.useState<string[]>([]);
  const [fetchError, setFetchError] = React.useState('');

  // Diagnostic Report States
  const [diagTesting, setDiagTesting] = React.useState(false);
  const [diagCopied, setDiagCopied] = React.useState(false);
  const [diagReportText, setDiagReportText] = React.useState<string>(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'N/A';
    const backend = (typeof localStorage !== 'undefined' && localStorage.getItem('pashto_novel_backend_url')) || 'https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app';
    
    return `==========================================
د افغان بانډي د انټرنیټ او شبکې تشخیصی راپور
==========================================
۱. د وسیلې آنلاین حالت: ${isOnline ? 'وصل دی (Online)' : 'قطع دی (Offline)'}
۲. موجود خلاص شوی چاپیریال (Origin): ${origin}
۳. فعال او کارول کیدونکی سرور: ${backend}
۴. د کلاوډ اصلي ملاتړی ادرس: https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app

------------------------------------------
د اپلیکیشن د انټرنیټ د ستونزو مکمل تخنیکي تحلیل:
------------------------------------------
الف) د ګرځنده تلیفون (APK) د لومړنۍ خلاصولو مشکل:
کله چې غوښتنلیک د APK فایل په توګه په موبایل کې نصب شي، په موبایل کې دننه سرور (Node.js/localhost) وجود نلري، نو له همدې امله نسبتي پیوستون (/api/posts) افلاین حالت ښیې.

ب) د ټلیګرام او CORS فلټر او بلاک کول:
ټلیګرام مستقیم د موبایل له وب ویو (WebView) او براوزر څخه د ډیټا رااېستلو مخه نیسي (CORS Blocked)، له همدې امله دا اپلیکیشن خپل پټ کلاوډ سرور کاروي.

ج) دقیق حل (Solution):
په لاندې بکس کې د سرور ادرس پر ځای همدا پته داخله کړه:
https://ais-dev-4xuxrlpowzv4l2utwp2m7n-392082030555.us-west1.run.app

==========================================`;
  });

  const handleRunDiagnostics = async () => {
    setDiagTesting(true);
    const logs: string[] = [];
    const startTime = Date.now();
    const backend = serverUrl.trim() || defaultBackend;

    logs.push(`[${new Date().toLocaleTimeString()}] د شبکې او سرور د راپور ازموینه پیل شوه...`);
    logs.push(`انټرنیټ سره پیوستون: ${navigator.onLine ? 'تایید شو (Online)' : 'قطع دی (Offline)'}`);
    logs.push(`ستاسو اپلیکیشن چاپیریال: ${window.location.href}`);
    logs.push(`د سرور ثبت شوې پته: ${backend}`);

    let apiStatus = 'نامعلومه';
    let bandiStatus = 'نامعلومه';
    let latency = '0ms';

    try {
      logs.push(`د /api/channel-info سرور ته د پیوستون هڅه...`);
      const res = await fetch(`${backend}/api/channel-info`, { signal: AbortSignal.timeout(6000) });
      latency = `${Date.now() - startTime}ms`;
      const contentType = res.headers.get('content-type') || '';
      if (res.ok) {
        if (contentType.includes('text/html')) {
          apiStatus = `۲۰۰ بریالی مګر د JSON پر ځای HTML ویب پاڼه راغله! (HTML page returned)`;
          logs.push(`خبرداری: سرور 200 OK شو مګر د API JSON پر ځای د HTML فایل راغی.`);
        } else {
          apiStatus = `۲۰۰ بریالی (OK) - ځنډ: ${latency}`;
          logs.push(`د سرور ځواب: 200 OK (${latency})`);
        }
      } else {
        apiStatus = `د سرور خطا کد: ${res.status}`;
        logs.push(`د سرور ځواب تېروتنه: ${res.status}`);
      }
    } catch (err: any) {
      apiStatus = `د پیوستون تېروتنه (${err.message || 'Timeout / Network Error'})`;
      logs.push(`تېروتنه: ${err.message || 'سرور ځواب ورنکړ'}`);
    }

    try {
      logs.push(`د بندي فیچ سکرېپر راوباسل شو...`);
      const bandiRes = await fetch(`${backend}/api/bandi-fetch?channel=${customChannel}`, { signal: AbortSignal.timeout(8000) });
      if (bandiRes.ok) {
        bandiStatus = '۲۰۰ بریالی (Bandi Scraper Active)';
        logs.push(`د بانډي فیچ سیسټم په بشپړ ډول روغ دی.`);
      } else {
        bandiStatus = `خطا کد: ${bandiRes.status}`;
      }
    } catch (err: any) {
      bandiStatus = `ناکام شو (${err.message || 'CORS / Server Fail'})`;
    }

    const fullReport = `==========================================
د افغان بانډي د انټرنیټ او سیسټم تشخیصی راپور
تاريخ او وخت: ${new Date().toLocaleString('ps-AF')}
==========================================

۱. آنلاین حالت (Device Online): ${navigator.onLine ? 'بلی (Online)' : 'نه (Offline)'}
۲. اوسنی چاپیریال (Environment): ${window.location.origin}
۳. کارول کیدونکی سرور (Active Backend): ${backend}
۴. د کانال د پیوستون حالت: ${apiStatus}
۵. د بندي فیچ سکرېپر حالت: ${bandiStatus}
۶. د ځنډ وخت (Latency): ${latency}

------------------------------------------
د انټرنیټ او افلاین حالت بشپړ تحلیل او لارښوونه:
------------------------------------------
• ۱. که چېرې اپلیکیشن افلاین ښکاري (Offline Issue):
  کله چې غوښتنلیک د APK په توګه واخیستل شي، له انټرنیټ پرته محلي سرور (localhost:3000) نلري. له همدې امله په اپلیکیشن کې زموږ له کلاوډ سرور ادرس څخه استفاده وکړئ:
  ${defaultBackend}

• ۲. د ټلیګرام د فلټر او CORS ستونزه:
  ټلیګرام په مستقيمه توګه د موبایل وب ویو (WebView) ته اجازه نه ورکوي. نو زموږ د بېلا بېل پرانستل شوي کلاوډ سرور برخه د دې کار لپاره فعال ده.

• ۳. د انټرنیټ ضعیف والی:
  که ستاسو انټرنیټ بې ثباته وي، غوښتنې ټلیګرام ته ځنډېږي.

------------------------------------------
سیستمي ریکارډونه او لوګونه (Live Logs):
${logs.map(l => `> ${l}`).join('\n')}
==========================================`;

    setDiagReportText(fullReport);
    setDiagTesting(false);
  };

  const handleCopyReportText = () => {
    try {
      navigator.clipboard.writeText(diagReportText);
      setDiagCopied(true);
      setTimeout(() => setDiagCopied(false), 3000);
    } catch (e) {
      // Fallback if clipboard API fails
      const el = document.getElementById('diag-report-textarea') as HTMLTextAreaElement;
      if (el) {
        el.select();
        document.execCommand('copy');
        setDiagCopied(true);
        setTimeout(() => setDiagCopied(false), 3000);
      }
    }
  };

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('bandi_fetch_latest_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFetchResult(parsed);
        setFetchLogsLocal(parsed.logs || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleBandiFetch = async () => {
    setFetching(true);
    setFetchError('');
    try {
      const backend = serverUrl.trim() || defaultBackend;
      const cleanChannel = customChannel.replace('@', '').trim();
      const url = `${backend}/api/bandi-fetch?force=${forceScrape}&channel=${cleanChannel}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`د سرور خطا: حالت ${res.status} (سرور ځواب ورنکړ)`);
      }
      const data = await res.json();
      if (data.success) {
        setFetchResult(data);
        setFetchLogsLocal(data.logs || []);
        localStorage.setItem('bandi_fetch_latest_data', JSON.stringify(data));
      } else {
        throw new Error(data.error || "د سکریپ کولو پروسه ناکامه شوه.");
      }
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "د سيسټم سره د اړیکې تېروتنه رامنځته شوه.");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveServerUrl = () => {
    try {
      let url = serverUrl.trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      localStorage.setItem('pashto_novel_backend_url', url);
      setServerUrl(url);
      setSaveStatus('سرور ادرس خوندي شو! مهرباني وکړئ خپرونې د نوي کولو لپاره اپلیکیشن یو ځل وتړئ او بیا خلاص کړئ.');
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (e) {
      setSaveStatus('د خوندي کولو تېروتنه.');
    }
  };

  const handleResetServerUrl = () => {
    try {
      localStorage.setItem('pashto_novel_backend_url', defaultBackend);
      setServerUrl(defaultBackend);
      setSaveStatus('سرور ادرس اصلي حالت ته بدل شو.');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <motion.div
      id="about-tab-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 sm:px-6 pb-24 text-right space-y-6"
    >
      {/* 1. Creator Profile and Details Card with rectangular cover image */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] overflow-hidden shadow-2xl relative">
        {/* Background ambient lighting */}
        <div className="absolute top-20 -left-10 w-40 h-40 bg-[#ffb900]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Cover Photo: Rectangular with sharp/clean top corners as requested ("مکمل صفحه ګول نه وي") */}
        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-[#2d2c30]">
          <img
            src={(() => {
              const rawUrl = appConfig.scraped_images?.[1] || appConfig.about_cover_url || "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=1000&q=80";
              if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
              }
              return rawUrl;
            })()}
            alt="کاور عکس"
            className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-4 right-5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb900] animate-pulse" />
            <span className="text-[10px] font-bold text-[#ffb900] tracking-wide font-sans">
              {channelInfo?.name || "افغان بانډي کلتوري بهیر"}
            </span>
          </div>
        </div>

        {/* Creator Info and Overlapping Profile Avatar */}
        <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center">
          
          {/* Creator Profile Photo: Overlaps cover photo half-half (نیمايي په کاور نیمايي لاندې) with code icon badge */}
          <div className="relative -mt-12 sm:-mt-14 z-10 mb-3.5">
            <img
              id="creator-profile-avatar"
              src={(() => {
                const rawUrl = appConfig.scraped_images?.[2] || appConfig.creator_avatar_url || "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=250&h=250&q=80";
                if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                  return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
                }
                return rawUrl;
              })()}
              alt="د کاريال جوړونکي انځور"
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full border-4 border-[#1c1b1f] hover:border-[#ffb900] transition-all duration-300 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Code Badge Badge (د کوډ نښه ورسره وي) */}
            <div className="absolute bottom-0 right-0 bg-[#ffb900] text-black p-1.5 rounded-full shadow-lg border-2 border-[#1c1b1f]" title={appConfig.about_code_badge_tooltip || "کوډ جوړونکي"}>
              <Code className="w-4 h-4" />
            </div>
          </div>

          {/* Profile Creator Name (عبيدالله غفاري) */}
          <div className="space-y-1.5 select-text">
            <h2 id="creator-title-name" className="text-xl sm:text-2xl font-black text-[#ffb900] tracking-tight">
              {appConfig.about_creator_name}
            </h2>
            <p className="text-xs sm:text-sm text-[#e3e2e6] font-medium">{appConfig.about_creator_role}</p>
            <p className="text-[10px] text-[#8e8d91] font-mono">{appConfig.about_creator_sub}</p>
          </div>

          {/* Intro Text */}
          <div className="border-t border-[#2d2c30]/70 w-full mt-5 pt-4 text-right">
            <p className="text-xs sm:text-sm text-[#c7c6ca] leading-relaxed font-normal select-text">
              {appConfig.about_intro_text}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Five Social Network Communication Links: Compact Grid Style with 3 or 4 columns (په هر قطار کي درې ځايیدل يا څلور) */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-4 text-right">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e3e2e6] flex items-center justify-end gap-2">
            <span>{appConfig.about_social_title || "رسمي اړیکې او ټولنیزې شبکې"}</span>
            <Heart className="w-4 h-4 text-[#ffb900]" />
          </h3>
          <p className="text-[10px] text-[#8e8d91] mt-1">{appConfig.about_social_desc || "زموږ د نوو خپرونو او ملاتړ لپاره په لاندې لارو اړیکه ونیسئ:"}</p>
        </div>

        {/* 5 Social Networks Buttons - 3 columns on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
          
          {/* 1. Telegram */}
          {appConfig.about_telegram_url && (
            <a
              id="social-link-telegram"
              href={appConfig.about_telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#ffb900]/15 border border-[#2d2c30]/60 hover:border-[#ffb900]/30 rounded-xl transition-all group"
              title={appConfig.about_telegram_label || "ټلیګرام"}
            >
              <Send className="w-4.5 h-4.5 text-[#ffb900] -rotate-45 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#ffb900] transition-colors">{appConfig.about_telegram_label || "ټلیګرام"}</span>
            </a>
          )}

          {/* 2. WhatsApp */}
          {appConfig.about_whatsapp_url && (
            <a
              id="social-link-whatsapp"
              href={appConfig.about_whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#25D366]/15 border border-[#2d2c30]/60 hover:border-[#25D366]/30 rounded-xl transition-all group"
              title={appConfig.about_whatsapp_label || "واټساپ"}
            >
              <MessageSquare className="w-4.5 h-4.5 text-[#25D366] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#25D366] transition-colors">{appConfig.about_whatsapp_label || "واټساپ"}</span>
            </a>
          )}

          {/* 3. Facebook */}
          {appConfig.about_facebook_url && (
            <a
              id="social-link-facebook"
              href={appConfig.about_facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#1877F2]/15 border border-[#2d2c30]/60 hover:border-[#1877F2]/30 rounded-xl transition-all group"
              title={appConfig.about_facebook_label || "فېسبوک"}
            >
              <Facebook className="w-4.5 h-4.5 text-[#1877F2] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#1877F2] transition-colors">{appConfig.about_facebook_label || "فېسبوک"}</span>
            </a>
          )}

          {/* 4. YouTube */}
          {appConfig.about_youtube_url && (
            <a
              id="social-link-youtube"
              href={appConfig.about_youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#FF0000]/15 border border-[#2d2c30]/60 hover:border-[#FF0000]/30 rounded-xl transition-all group"
              title={appConfig.about_youtube_label || "یوټیوب"}
            >
              <Youtube className="w-4.5 h-4.5 text-[#FF0000] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#FF0000] transition-colors">{appConfig.about_youtube_label || "یوټیوب"}</span>
            </a>
          )}

          {/* 5. Email */}
          {appConfig.about_email && (
            <a
              id="social-link-email"
              href={`mailto:${appConfig.about_email}`}
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#9c27b0]/15 border border-[#2d2c30]/60 hover:border-[#9c27b0]/30 rounded-xl transition-all group col-span-2 sm:col-span-1"
              title={appConfig.about_email_label || "برېښنالیک"}
            >
              <Mail className="w-4.5 h-4.5 text-[#9c27b0] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#9c27b0] transition-colors">{appConfig.about_email_label || "برېښنالیک"}</span>
            </a>
          )}

        </div>
      </div>

      {/* 3. Simple Audio Quality Section (Replacement of system connection) */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-[#8e8d91] flex items-center justify-end gap-2 border-b border-[#2d2c30] pb-2">
          <span>{appConfig.about_lib_title}</span>
          <BookOpen className="w-4.5 h-4.5 text-[#ffb900]" />
        </h3>

        <div className="text-[11px] sm:text-xs text-[#8e8d91] space-y-2 leading-relaxed">
          {appConfig.about_lib_points.map((pt, i) => (
            <p key={i}>{pt}</p>
          ))}
        </div>
      </div>

      {/* 4. Bandi Fetch System Control Panel */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-[#e3e2e6] flex items-center justify-end gap-2 border-b border-[#2d2c30] pb-2">
          <span>د بندي فیچ هوښیار لوډولو سيسټم</span>
          <Cpu className="w-4.5 h-4.5 text-[#ffb900]" />
        </h3>
        
        <p className="text-[11px] text-[#8e8d91] leading-relaxed text-right">
          د بندي فیچ (Bandi Fetch) په مرسته تاسو کولی شئ په مستقیم او ژوندي ډول د ټلیګرام کانال څخه د غږیزو ناولونو او خپرونو وروستي معلومات او غږونه لوډ کړئ.
        </p>

        <div className="space-y-3 pt-1">
          {/* Channel Input & Force Fetch Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 text-right">
              <label className="text-[10px] text-[#8e8d91] block">د ټلیګرام کانال پته (ID)</label>
              <div className="relative">
                <input
                  type="text"
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  dir="ltr"
                  className="w-full pl-7 pr-3 py-2 bg-[#2d2c30]/50 border border-[#484649] rounded-xl text-xs text-[#e3e2e6] focus:outline-none focus:border-[#ffb900]"
                  placeholder="afghan_bandi"
                />
                <span className="absolute left-3 top-2 text-xs text-[#8e8d91]">@</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <span className="text-[11px] text-[#e3e2e6]">ژوندی نوی سکریپ او لوډول (تازه کول)</span>
              <input
                type="checkbox"
                checked={forceScrape}
                onChange={(e) => setForceScrape(e.target.checked)}
                className="w-4 h-4 rounded accent-[#ffb900] bg-[#2d2c30] border-[#484649]"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleBandiFetch}
            disabled={fetching}
            className={`w-full py-3 bg-[#ffb900] hover:bg-[#ffe082] disabled:bg-[#2d2c30] text-black disabled:text-[#8e8d91] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2`}
          >
            {fetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>د معلوماتو د لوډولو پروسه روانه ده...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>معلومات او غږونه راوباسئ (لوډ کړئ)</span>
              </>
            )}
          </button>

          {/* Status Display */}
          {fetchResult && (
            <div className="bg-[#2d2c30]/30 rounded-xl p-3 border border-[#2d2c30] text-right space-y-1.5">
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-[#8e8d91] font-mono">{fetchResult.timestamp?.substring(11, 19)}</span>
                <span className="text-[#e3e2e6] font-medium">وروستی بریالی لوډ:</span>
              </div>
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-[#ffb900] font-mono">{fetchResult.posts?.length || 0} برخې</span>
                <span className="text-[#e3e2e6] font-medium">موندل شوي فصلونه:</span>
              </div>
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-green-400 font-medium">{fetchResult.source || "عامه سيسټم"}</span>
                <span className="text-[#e3e2e6] font-medium">د لوډولو سرچینه:</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {fetchError && (
            <div className="bg-red-950/20 border border-red-900 rounded-xl p-3 text-right flex items-start gap-2 text-red-400">
              <div className="flex-1 text-[10px] sm:text-xs">{fetchError}</div>
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            </div>
          )}

          {/* Live Log Terminal */}
          {fetchLogsLocal.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8e8d91] font-mono">Bandi Fetch Console v1.2</span>
                <span className="text-[10px] text-[#e3e2e6] flex items-center gap-1">
                  <span>لوګونه او د سیسټم راپور</span>
                  <Terminal className="w-3.5 h-3.5 text-[#ffb900]" />
                </span>
              </div>
              <div className="bg-black/90 border border-[#2d2c30] rounded-xl p-3 h-32 overflow-y-auto font-mono text-[9px] text-[#8e8d91] space-y-1 text-left select-all">
                {fetchLogsLocal.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-tight">
                    <span className="text-[#ffb900] mr-1.5">&gt;</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. API Server Connection Settings */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-[#e3e2e6] flex items-center justify-end gap-2 border-b border-[#2d2c30] pb-2">
          <span>د سیسټم تنظیمات (سرور پیوستون)</span>
          <Sparkles className="w-4.5 h-4.5 text-[#ffb900]" />
        </h3>
        <p className="text-[10px] text-[#8e8d91] leading-relaxed">
          که چېرې غوښتنلیک د سټوډیو څخه د غږونو خلاصولو یا لوډولو کې ستونزه ولري، تاسو کولی شئ دلته د خپل سرور ادرس بدل یا تنظیم کړئ:
        </p>
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            dir="ltr"
            className="w-full px-3 py-2.5 bg-[#2d2c30]/50 border border-[#484649] rounded-xl text-xs text-[#e3e2e6] focus:outline-none focus:border-[#ffb900] tracking-wide"
            placeholder="https://your-server.run.app"
          />
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={handleResetServerUrl}
              className="px-3 py-2 bg-[#2d2c30] text-[#c7c6ca] hover:text-white rounded-xl text-[10px] font-bold transition-all"
            >
              اصلي حالت ته اړول
            </button>
            <button
              onClick={handleSaveServerUrl}
              className="px-3 py-2 bg-[#ffb900] text-black hover:bg-[#ffe082] rounded-xl text-[10px] font-bold transition-all"
            >
              ادرس خوندي کول
            </button>
          </div>
          {saveStatus && (
            <p className="text-[10px] text-[#ffb900] text-right mt-2 animate-pulse">{saveStatus}</p>
          )}
        </div>
      </div>

      {/* 6. Comprehensive Network Diagnostic & Report Copier Card */}
      <div className="bg-[#1c1b1f] border border-[#ffb900]/30 rounded-[24px] p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb900]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[#2d2c30] pb-2.5">
          <button
            onClick={handleRunDiagnostics}
            disabled={diagTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffb900]/15 hover:bg-[#ffb900]/30 text-[#ffb900] rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer border border-[#ffb900]/30"
          >
            <Activity className={`w-3.5 h-3.5 ${diagTesting ? 'animate-spin' : ''}`} />
            <span>{diagTesting ? 'د تحلیل ازموینه روانه ده...' : 'د شبکې راپور نوی کړئ'}</span>
          </button>

          <h3 className="text-xs sm:text-sm font-bold text-[#ffb900] flex items-center gap-2">
            <span>د انټرنیټ او اتصال مکمل تشخیصی راپور</span>
            <ShieldAlert className="w-4.5 h-4.5 text-[#ffb900]" />
          </h3>
        </div>

        <p className="text-[11px] text-[#8e8d91] leading-relaxed text-right">
          تاسو کولی شئ لاندې مکمل راپور چی د افلاین حالت او انټرنیټي ستونزو تشریح پکې لیکل شوې ده، پوره کاپي کړئ او ماته یې دلته پېسټ کړئ:
        </p>

        {/* Action button to copy report */}
        <div className="flex items-center justify-between bg-[#2d2c30]/40 p-2.5 rounded-xl border border-[#2d2c30]">
          <button
            onClick={handleCopyReportText}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffb900] hover:bg-[#ffe082] text-black font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {diagCopied ? (
              <>
                <Check className="w-4 h-4 text-green-900" />
                <span className="text-green-950 font-black">راپور کاپي شو!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>د مکمل راپور کاپي کول (Copy Report)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8e8d91]">د وسیلې حالت:</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${typeof navigator !== 'undefined' && navigator.onLine ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {typeof navigator !== 'undefined' && navigator.onLine ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {typeof navigator !== 'undefined' && navigator.onLine ? 'انټرنیټ وصل دی' : 'انټرنیټ پرې شوی'}
            </span>
          </div>
        </div>

        {/* Copyable Text Box */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[10px] text-[#8e8d91]">
            <span className="font-mono">Pashto Network Diagnostic Log v2.0</span>
            <span className="flex items-center gap-1 text-[#e3e2e6]">
              <span>د راپور متن (کاپي کولو او ټاکلو وړ):</span>
              <FileText className="w-3.5 h-3.5 text-[#ffb900]" />
            </span>
          </div>
          
          <textarea
            id="diag-report-textarea"
            readOnly
            value={diagReportText}
            dir="rtl"
            rows={10}
            className="w-full bg-black/90 border border-[#2d2c30] focus:border-[#ffb900] rounded-xl p-3 text-[10px] text-[#ffb900] font-mono leading-relaxed focus:outline-none resize-none select-all"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      </div>
    </motion.div>
  );
};

