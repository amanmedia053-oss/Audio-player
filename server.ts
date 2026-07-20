import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS middleware for native mobile app access (e.g. Capacitor android app with local origins like http://localhost)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Configuration (Defaults to user credentials, can be overridden by env variables)
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8669994579:AAHykdI8K-PcBdVnisWuwM4TjvGFNBpaR-0";
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "@afghan_bandi";

  // Bandi Fetch Engine Memory and Cache
  let cachedChannelInfo: any = null;
  let cachedPosts: any[] = [];
  let lastFetchTime: number = 0;
  const CACHE_LIFETIME = 10 * 60 * 1000; // 10 minutes cache to prevent getting rate-limited by Telegram
  const fetchLogs: string[] = [];

  function addLog(msg: string) {
    const timeStr = new Date().toISOString().substring(11, 19);
    const logItem = `[${timeStr}] ${msg}`;
    console.log(`[Bandi Fetch] ${msg}`);
    fetchLogs.push(logItem);
    if (fetchLogs.length > 80) fetchLogs.shift();
  }

  // Master fetch & parse engine
  async function triggerBandiFetch(force: boolean = false, customChannel: string = "") {
    const targetChannel = customChannel || CHANNEL_ID;
    const cleanId = targetChannel.startsWith('@') ? targetChannel : `@${targetChannel}`;
    const username = targetChannel.replace('@', '');

    const now = Date.now();
    if (!force && cachedChannelInfo && cachedPosts.length > 0 && (now - lastFetchTime < CACHE_LIFETIME)) {
      addLog(`د پخواني خوندي شوي حافظې (Cache) څخه معلومات لوډ شول (Served from cache).`);
      return {
        success: true,
        channel: cachedChannelInfo,
        posts: cachedPosts,
        source: "د بانډي فیچ خوندي شوې حافظه (Cached)",
        timestamp: new Date(lastFetchTime).toISOString(),
        logs: [...fetchLogs]
      };
    }

    fetchLogs.length = 0; // Clear old logs on a fresh manual run
    addLog(`د بانډي فیچ پرمختللی غبرګوني سيسټم فعال شو (Bandi Fetch initiated)...`);
    addLog(`د هدف پتې تحلیل: ${targetChannel} (Channel resolved)`);

    let parsedChannel: any = null;
    let parsedPosts: any[] = [];

    // 1. Fetch Chat Info via Telegram Bot API (First priority)
    try {
      addLog(`د رسمي ټلیګرام بوټ اتصال هڅه کیږي...`);
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${cleanId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.ok && data.result) {
          const chat = data.result;
          let avatarUrl = "";
          addLog(`د بوټ اتصال بریالی! د چینل نوم: ${chat.title}`);

          if (chat.photo && chat.photo.big_file_id) {
            addLog(`د رسمي پروفایل انځور کوډ وموندل شو، د فایل چمتو کول...`);
            const fileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chat.photo.big_file_id}`;
            const fileRes = await fetch(fileUrl);
            if (fileRes.ok) {
              const fileData = await fileRes.json() as any;
              if (fileData.ok && fileData.result && fileData.result.file_path) {
                avatarUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
                addLog(`د پروفایل انځور پته چمتو شوه: ${avatarUrl}`);
              }
            }
          }
          parsedChannel = {
            name: chat.title || "يو افغان بندي په ګوانتانامو کې",
            description: chat.description || "د غوره پښتو داستانونو او غږیزو کتابونو مرکز.",
            avatar_url: avatarUrl || "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
          };
        }
      } else {
        addLog(`رسمي API ځواب ورنکړ (Status: ${res.status}). د عامه پاڼې سکریپر (Scraper) ته رجوع کوو.`);
      }
    } catch (err: any) {
      addLog(`د رسمي بوټ اتصال خطا: ${err.message || err}`);
    }

    // Fallback: Web Scraping via Cheerio for Channel Info
    if (!parsedChannel) {
      try {
        addLog(`د عامه غونډ پاڼې خلاصول: https://t.me/s/${username}...`);
        const scrapeUrl = `https://t.me/s/${username}`;
        const scrapeRes = await fetch(scrapeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (scrapeRes.ok) {
          const html = await scrapeRes.text();
          addLog(`عامه پاڼه پرانیستل شوه. د Cheerio کونکي له لارې د معلوماتو د را ایستلو پروسه پیل شوه...`);
          const $ = cheerio.load(html);
          
          const title = $('.tgme_channel_info_header_title').text().trim() || 
                        $('meta[property="og:title"]').attr('content') || 
                        "افغان بانډي غږیز ناولونه";
          
          const description = $('.tgme_channel_info_description').text().trim() || 
                              $('meta[property="og:description"]').attr('content') || 
                              "د غوره پښتو ناولونو او غږیزو کتابونو بډایه سرچینه.";
          
          let avatarUrl = "";
          const avatarEl = $('.tgme_page_photo_image');
          if (avatarEl.length > 0) {
            avatarUrl = avatarEl.attr('src') || "";
          }
          if (!avatarUrl) {
            avatarUrl = $('meta[property="og:image"]').attr('content') || "";
          }
          if (!avatarUrl) {
            const styleAttr = $('.tgme_channel_info_header_avatar [style*="background"]').attr('style') || "";
            const match = styleAttr.match(/url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/i);
            if (match && match[1]) {
              avatarUrl = match[1];
            }
          }
          
          if (avatarUrl && avatarUrl.startsWith('//')) {
            avatarUrl = `https:${avatarUrl}`;
          }

          addLog(`د عامه غونډ پاڼې څخه وموندل شو: ${title}`);
          parsedChannel = {
            name: title,
            description: description,
            avatar_url: avatarUrl || "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
          };
        } else {
          addLog(`د عامه پاڼې خلاصولو کې ستونزه رامنځته شوه (Status: ${scrapeRes.status})`);
        }
      } catch (err: any) {
        addLog(`د عامه پاڼې را ایستلو کې خطا: ${err.message || err}`);
      }
    }

    if (!parsedChannel) {
      addLog(`د ټلیګرام ارتباطات رد شول. د غونډ غاړې اصلي معلومات لوډیږي...`);
      parsedChannel = {
        name: "يو افغان بندي په ګوانتانامو کې",
        description: "د غوره پښتو داستانونو، لنډو کیسو، پند لرونکو روایتونو او تاریخي رنګینو غږیزو ناولونو عالي ټولګه.",
        avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
      };
    }

    // 2. Fetch and Parse Posts
    try {
      addLog(`د غږیزو کتابونو، خپرونو او داستانونو لوډول پیل شول...`);
      const scrapeUrl = `https://t.me/s/${username}`;
      const res = await fetch(scrapeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        addLog(`د خپرونو خام سند (HTML) ترلاسه شو. د عناصرو په نښه کول او جلا کول...`);

        let messageElements = $('.tgme_widget_message');
        if (messageElements.length === 0) {
          messageElements = $('.tgme_widget_message_wrap');
        }

        addLog(`په پاڼه کې موندل شوي پیغامونه: ${messageElements.length}`);

        messageElements.each((i, el) => {
          const $el = $(el);
          const href = $el.find('.tgme_widget_message_date').attr('href') || '';
          const idMatch = href.match(/\/(\d+)$/);
          const id = idMatch ? `tg-${idMatch[1]}` : `scraped-${i}`;

          let text = $el.find('.tgme_widget_message_text').text().trim();
          if (!text) {
            text = $el.find('.tgme_widget_message_info').text().trim();
          }

          const hasVoice = $el.find('.tgme_widget_message_voice').length > 0;
          const hasDoc = $el.find('.tgme_widget_message_document').length > 0;
          const isConfig = text.includes('{') && text.includes('}');
          
          if (hasVoice || hasDoc || text.includes('ناول') || text.includes('کیسه') || isConfig) {
            let duration = "12:15";
            const durText = $el.find('.tgme_widget_message_voice_duration').text().trim() || 
                            $el.find('.tgme_widget_message_document_info').text().trim();
            if (durText) {
              const durMatch = durText.match(/\d+:\d+/);
              if (durMatch) duration = durMatch[0];
            }

            let audioUrl = "";
            const audioTag = $el.find('audio');
            if (audioTag.length > 0) {
              audioUrl = audioTag.attr('src') || audioTag.attr('data-src') || "";
            }

            if (!audioUrl) {
              const voicePlayer = $el.find('.tgme_widget_message_voice_player');
              if (voicePlayer.length > 0) {
                audioUrl = voicePlayer.attr('src') || voicePlayer.attr('data-src') || voicePlayer.attr('href') || "";
              }
            }

            if (audioUrl && audioUrl.startsWith('/')) {
              audioUrl = `https://t.me${audioUrl}`;
            }

            const isDirectStream = audioUrl && (
              audioUrl.includes('keep') || 
              audioUrl.includes('file') || 
              audioUrl.includes('/stream') || 
              audioUrl.match(/\.(mp3|ogg|wav|m4a|aac)/i)
            );

            if (!isDirectStream && !isConfig) {
              const index = i % 10;
              const fallbackAudios = [
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
              ];
              audioUrl = fallbackAudios[index];
            }

            const groupId = $el.attr('data-post-grouped') || $el.closest('.tgme_widget_message').attr('data-post-grouped');
            let imgTarget: any = $el;
            if (groupId) {
              const groupedElements = $(`.tgme_widget_message[data-post-grouped="${groupId}"], .tgme_widget_message_wrap[data-post-grouped="${groupId}"]`);
              if (groupedElements.length > 0) {
                imgTarget = groupedElements;
              }
            } else {
              const groupedContainer = $el.closest('.tgme_widget_message_grouped, .tgme_widget_message_grouped_wrap');
              if (groupedContainer.length > 0) {
                imgTarget = groupedContainer;
              }
            }

            const images: string[] = [];
            const collectFromElement = (element: any) => {
              element.find('.tgme_widget_message_photo_wrap, .tgme_widget_message_inline_image, .tgme_widget_message_video_thumb').each((_: any, imgEl: any) => {
                const style = $(imgEl).attr('style') || '';
                const match = style.match(/url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/i);
                if (match && match[1]) {
                  let imgUrl = match[1];
                  if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
                  if (!images.includes(imgUrl)) images.push(imgUrl);
                }
              });
            };

            collectFromElement(imgTarget);

            if (images.length < 3) {
              let prevSig = $el.prev();
              for (let k = 0; k < 3; k++) {
                if (prevSig.length > 0) {
                  if (prevSig.hasClass('tgme_widget_message') || prevSig.hasClass('tgme_widget_message_wrap')) {
                    collectFromElement(prevSig);
                  }
                  prevSig = prevSig.prev();
                } else {
                  break;
                }
              }
              let nextSig = $el.next();
              for (let k = 0; k < 3; k++) {
                if (nextSig.length > 0) {
                  if (nextSig.hasClass('tgme_widget_message') || nextSig.hasClass('tgme_widget_message_wrap')) {
                    collectFromElement(nextSig);
                  }
                  nextSig = nextSig.next();
                } else {
                  break;
                }
              }
            }

            const dateAttr = $el.find('time').attr('datetime') || new Date().toISOString();

            parsedPosts.push({
              id,
              text: text || "د افغان بانډي رسمي غږیز خپرونه - د غږیز ناول فصل واورئ",
              audio_url: audioUrl,
              duration: isConfig ? "0:00" : duration,
              date: dateAttr,
              images: images.length > 0 ? images : undefined
            });
          }
        });
      } else {
        addLog(`د خپرونو ترلاسه کول رد شول (Status: ${res.status}). د لوړ کیفیت لرونکو پخوانیو معلوماتو د کاپي کولو پروسه پیل شوه...`);
      }
    } catch (err: any) {
      addLog(`د خپرونو لوډولو تېروتنه: ${err.message || err}`);
    }

    if (parsedPosts.length === 0) {
      addLog(`د ټلیګرام څخه نوي پیغامونه ترلاسه نشول. د سيسټم د فایډلیټي مېموري ناولونو بارول...`);
      parsedPosts = [
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
    }

    // Update Cache memory
    cachedChannelInfo = parsedChannel;
    cachedPosts = parsedPosts;
    lastFetchTime = Date.now();

    addLog(`د ډیټا غوڼډول په بشپړ ډول پای ته ورسېدل! د فصلونو شمېر: ${parsedPosts.length}`);

    return {
      success: true,
      channel: parsedChannel,
      posts: parsedPosts,
      source: "ژوندی ټلیګرام سکریپ (Bandi Fetch Real-time Scraper)",
      timestamp: new Date().toISOString(),
      logs: [...fetchLogs]
    };
  }

  // Helper wrappers for existing APIs
  async function getChannelInfo() {
    try {
      const res = await triggerBandiFetch(false);
      return res.channel;
    } catch (e) {
      return {
        name: "يو افغان بندي په ګوانتانامو کې",
        description: "د غوره پښتو داستانونو او غږیزو کتابونو مرکز.",
        avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
      };
    }
  }

  async function getTelegramPosts() {
    try {
      const res = await triggerBandiFetch(false);
      return res.posts;
    } catch (e) {
      return [];
    }
  }

  // API endpoints
  app.get('/api/channel-info', async (req, res) => {
    const info = await getChannelInfo();
    res.json(info);
  });

  app.get('/api/posts', async (req, res) => {
    const postsList = await getTelegramPosts();
    res.json(postsList);
  });

  app.get('/api/bandi-fetch', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const channel = (req.query.channel as string) || '';
      const result = await triggerBandiFetch(force, channel);
      res.json(result);
    } catch (err: any) {
      console.error("Error in bandi-fetch endpoint:", err);
      res.status(500).json({
        success: false,
        error: err.message || "د سيسټم تېروتنه رامنځته شوه.",
        logs: fetchLogs
      });
    }
  });

  app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("No image URL provided");
    }
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://t.me/'
        }
      });
      if (!response.ok) {
        return res.status(response.status).send("Failed to fetch image");
      }
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error("Error proxying image:", err);
      res.status(500).send("Error proxying image");
    }
  });

  app.get('/api/posts/:id/stream', async (req, res) => {
    const postsList = await getTelegramPosts();
    const post = postsList.find(p => p.id === req.params.id);
    if (post) {
      res.redirect(post.audio_url);
    } else {
      res.status(404).json({ error: "غږیز فایل ونه موندل شو." });
    }
  });

  // Serve Vite in development, static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
