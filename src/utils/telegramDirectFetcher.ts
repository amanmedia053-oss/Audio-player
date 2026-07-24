import { ChannelInfo, Post } from '../types';

/**
 * Direct client-side parser for Telegram Public Channels (https://t.me/s/CHANNEL_NAME)
 * This enables the mobile Capacitor APK to fetch live channel posts and audio directly 
 * without exposing secret bot tokens or relying on temporary preview server proxies.
 */

export async function fetchTelegramDirect(channelHandle: string = 'afghan_bandi'): Promise<{ channel: ChannelInfo; posts: Post[] }> {
  const cleanChannel = channelHandle.replace('@', '').trim() || 'afghan_bandi';
  const targetUrl = `https://t.me/s/${cleanChannel}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      referrerPolicy: 'no-referrer',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`د ټلیګرام ځواب تېروتنه: ${response.status}`);
    }

    const htmlText = await response.text();

    // Use browser native DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 1. Extract Channel Info
    const titleEl = doc.querySelector('.tgme_channel_info_header_title, .tgme_page_title span');
    const title = titleEl ? titleEl.textContent?.trim() || 'افغان بندي' : 'افغان بندي';

    const photoEl = doc.querySelector('.tgme_page_photo_image img') as HTMLImageElement | null;
    const photo = photoEl ? photoEl.getAttribute('src') || '' : '';

    const subscribersEl = doc.querySelector('.tgme_channel_info_counter .counter_value');
    const subscribers = subscribersEl ? subscribersEl.textContent?.trim() || '' : '';

    const descriptionEl = doc.querySelector('.tgme_channel_info_description');
    const description = descriptionEl ? descriptionEl.textContent?.trim() || 'د افغان بندي غږیز کتابونو او لیکنو رسمي خپرندویه چینل' : 'د افغان بندي غږیز کتابونو او لیکنو رسمي خپرندویه چینل';

    const channelInfo: ChannelInfo = {
      name: title,
      avatar_url: photo,
      description: description
    };

    // 2. Extract Message Posts
    const messageNodes = doc.querySelectorAll('.tgme_widget_message');
    const parsedPosts: Post[] = [];

    messageNodes.forEach((node, index) => {
      // Ignore system and service messages
      const isServiceMessage = node.querySelector('.tgme_widget_message_service, .service_message') !== null;
      if (isServiceMessage) return;

      const id = node.getAttribute('data-post') || `direct-${index}-${Date.now()}`;
      
      const textNode = node.querySelector('.tgme_widget_message_text');
      const text = textNode ? textNode.textContent?.trim() || '' : '';

      const lowerText = text.toLowerCase();
      const isSystemText =
        lowerText.includes('channel created') ||
        lowerText.includes('channel photo updated') ||
        lowerText.includes('channel name changed') ||
        lowerText.includes('pinned a message') ||
        lowerText.includes('چینل جوړ شو') ||
        lowerText.includes('چینل انځور بدلون');

      const isJsonConfig = text.includes('{') && text.includes('}');

      if (isSystemText && !isJsonConfig) return;

      // Date & Time
      const timeNode = node.querySelector('.tgme_widget_message_date time');
      const date = timeNode ? timeNode.getAttribute('datetime') || new Date().toISOString() : new Date().toISOString();

      // Images
      const images: string[] = [];
      const imageNodes = node.querySelectorAll('.tgme_widget_message_photo_wrap');
      imageNodes.forEach((imgWrap) => {
        const style = imgWrap.getAttribute('style') || '';
        const match = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
        if (match && match[1]) {
          images.push(match[1]);
        }
      });

      // Audio file links
      let audio_url = '';
      let duration = '';

      const audioNode = node.querySelector('audio');
      if (audioNode) {
        audio_url = audioNode.getAttribute('src') || audioNode.getAttribute('data-src') || '';
      }

      if (!audio_url) {
        const voicePlayer = node.querySelector('.tgme_widget_message_voice_player');
        if (voicePlayer) {
          audio_url = voicePlayer.getAttribute('src') || voicePlayer.getAttribute('data-src') || voicePlayer.getAttribute('href') || '';
        }
      }

      if (!audio_url) {
        const docLink = node.querySelector('a.tgme_widget_message_document_wrap, a.tgme_widget_message_document_title, a[href*=".mp3"], a[href*=".m4a"], a[href*=".ogg"]') as HTMLAnchorElement | null;
        if (docLink) {
          audio_url = docLink.getAttribute('href') || docLink.getAttribute('data-src') || '';
        }
      }

      if (audio_url && audio_url.startsWith('/')) {
        audio_url = `https://t.me${audio_url}`;
      }

      const durationNode = node.querySelector('.tgme_widget_message_document_extra, .tgme_widget_message_voice_duration');
      if (durationNode) {
        duration = durationNode.textContent?.trim() || '';
      }

      const isHashtagImages = text.includes('#انځورونه');

      // ONLY keep posts that contain an audio file or voice note (or JSON config or #انځورونه hashtag)
      if ((audio_url && audio_url.trim() !== '') || isJsonConfig || isHashtagImages) {
        parsedPosts.push({
          id,
          text,
          audio_url,
          duration,
          date,
          images
        });
      }
    });

    if (parsedPosts.length > 0) {
      return { channel: channelInfo, posts: parsedPosts };
    }

    throw new Error('په مستقیم ټلیګرام پاڼه کې کوم نوی پیغام ونه موندل شو.');

  } catch (err: any) {
    console.warn('Direct Telegram fetch failed:', err?.message || err);
    throw err;
  }
}

/**
 * Built-in fallback audio chapters when network is completely offline
 */
export const FALLBACK_CHAPTERS: Post[] = [];

export const FALLBACK_CHANNEL: ChannelInfo = {
  name: "افغان بندي (Afghan Bandi)",
  avatar_url: "https://images.unsplash.com/photo-1474932430478-367db26836c1?w=300&h=300&fit=crop",
  description: "د افغان بندي غږیز ناول او حماسي کیسو رسمي ټولګه او غږیز حساب."
};
