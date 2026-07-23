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
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json() as any;
        if (data.ok && data.result) {
          const chat = data.result;
          let avatarUrl = "";
          addLog(`د بوټ اتصال بریالی! د چینل نوم: ${chat.title}`);

          if (chat.photo && chat.photo.big_file_id) {
            addLog(`د رسمي پروفایل انځور کوډ وموندل شو، د فایل چمتو کول...`);
            const fileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chat.photo.big_file_id}`;
            const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(3500) });
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
          },
          signal: AbortSignal.timeout(3500)
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
      addLog(`د ټلیګرام معلومات ونه موندل شول.`);
      parsedChannel = {
        name: "يو افغان بندي په ګوانتانامو کې",
        description: "د غوره پښتو داستانونو او غږیزو کتابونو مرکز.",
        avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
      };
    }

    // 2. Fetch and Parse Posts
    try {
      addLog(`د غږیزو کتابونو او خپرونو لوډول پیل شول...`);
      const scrapeUrl = `https://t.me/s/${username}`;
      const res = await fetch(scrapeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        addLog(`د خپرونو ترلاسه شوې پاڼه تجزیه کېږي...`);
        
        $('.tgme_widget_message').each((i, el) => {
          const $el = $(el);
          const id = $el.attr('data-post') || `post-${i}`;
          const text = $el.find('.tgme_widget_message_text').text().trim();
          const hasVoice = $el.find('.tgme_widget_message_voice, .tgme_widget_message_voice_player, audio').length > 0;
          const hasDoc = $el.find('.tgme_widget_message_document, .tgme_widget_message_document_icon').length > 0;
          const isConfig = text.includes('{') && text.includes('}');
          
          if (text || hasVoice || hasDoc || isConfig) {
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

            if (!audioUrl) {
              const docTitleLink = $el.find('a.tgme_widget_message_document_title, a.tgme_widget_message_document, a[href*=".mp3"], a[href*=".m4a"], a[href*=".ogg"]');
              if (docTitleLink.length > 0) {
                audioUrl = docTitleLink.attr('href') || docTitleLink.attr('data-src') || "";
              }
            }

            if (audioUrl && audioUrl.startsWith('/')) {
              audioUrl = `https://t.me${audioUrl}`;
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

            // Only include posts that actually contain an audio file or JSON config
            if (audioUrl || isConfig) {
              parsedPosts.push({
                id,
                text: text || "د افغان بانډي رسمي غږیز خپرونه - د غږیز ناول فصل واورئ",
                audio_url: audioUrl,
                duration: isConfig ? "0:00" : duration,
                date: dateAttr,
                images: images.length > 0 ? images : undefined
              });
            }
          }
        });
      } else {
        addLog(`د خپرونو ترلاسه کول رد شول (Status: ${res.status}).`);
      }
    } catch (err: any) {
      addLog(`د خپرونو لوډولو تېروتنه: ${err.message || err}`);
    }

    if (parsedPosts.length === 0) {
      addLog(`په ټلیګرام کې نوي پیغامونه مستقیم ونه موندل شول. د رسمي افغان بانډي د ملاتړ غږیز لیست روښانه کول...`);
      parsedPosts = [
        {
          id: "afg-1",
          text: "د افغان بندي غږیز ناول - لومړی فصل: د ګوانتانامو له تورې زندان څخه د زړه دردونکي کیسې پیل، ظالمانه تحقیقات او د نوي مبارزې روحیه.",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          duration: "18:20",
          date: new Date().toISOString(),
          images: ["https://images.unsplash.com/photo-1474932430478-367db26836c1?w=600&h=400&fit=crop"]
        },
        {
          id: "afg-2",
          text: "د افغان بندي غږیز ناول - دویم فصل: د بګرام پنجرې او د زړو بندي ملګرو داستانونه، ترخې خاطرې او په صابر زړه د وطن یادونه.",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          duration: "14:40",
          date: new Date(Date.now() - 86400000).toISOString(),
          images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop"]
        },
        {
          id: "afg-3",
          text: "د افغان بندي غږیز ناول - درېیم فصل: د پټو اوښکو مینه او د تورې شپې الهامونه، د برخلیک ستونزې او د هیلې څرک.",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          duration: "12:15",
          date: new Date(Date.now() - 172800000).toISOString(),
          images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop"]
        },
        {
          id: "afg-4",
          text: "د افغان بندي غږیز ناول - څلورم فصل: د ازادۍ د کاروان را رسیدل او د خپلو مجاهدینو ملګرو سره لیدنه او ملګرتیا.",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
          duration: "15:10",
          date: new Date(Date.now() - 259200000).toISOString(),
          images: ["https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=400&fit=crop"]
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
  async function getChannelInfo(force: boolean = false) {
    try {
      const res = await triggerBandiFetch(force);
      return res.channel;
    } catch (e) {
      return {
        name: "يو افغان بندي په ګوانتانامو کې",
        description: "د غوره پښتو داستانونو او غږیزو کتابونو مرکز.",
        avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=250&h=250&fit=crop"
      };
    }
  }

  async function getTelegramPosts(force: boolean = false) {
    try {
      const res = await triggerBandiFetch(force);
      return res.posts;
    } catch (e) {
      return [];
    }
  }

  // API endpoints
  app.get('/api/channel-info', async (req, res) => {
    const force = req.query.force === 'true';
    const info = await getChannelInfo(force);
    res.json(info);
  });

  app.get('/api/posts', async (req, res) => {
    const force = req.query.force === 'true';
    const postsList = await getTelegramPosts(force);
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
    try {
      const postsList = await getTelegramPosts();
      const post = postsList.find(p => p.id === req.params.id);
      if (post && post.audio_url && post.audio_url.trim().length > 0) {
        return res.redirect(post.audio_url);
      } else {
        return res.status(404).json({ error: "غږیز فایل ونه موندل شو یا آډیو لینک شتون نلري." });
      }
    } catch (e: any) {
      return res.status(500).json({ error: "د آډیو خپرولو پر مهال تېروتنه رامنځته شوه." });
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
