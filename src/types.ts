export interface Post {
  id: string;
  text: string;
  audio_url: string;
  duration: string;
  date: string;
  images?: string[];
}

export interface ChannelInfo {
  name: string;
  description: string;
  avatar_url: string;
}

export interface PlaybackProgress {
  postId: string;
  currentTime: number;
  duration: number; // in seconds
  percentage: number;
  updatedAt: string;
}

export interface AppConfig {
  channel_name?: string;
  channel_description?: string;
  
  // Tab Labels
  tab_home: string;
  tab_favorites: string;
  tab_history: string;
  tab_about: string;

  // About Tab Profile details
  about_creator_name: string;
  about_creator_role: string;
  about_creator_sub: string;
  about_intro_text: string;

  // Social Links
  about_telegram_url: string;
  about_whatsapp_url: string;
  about_facebook_url: string;
  about_youtube_url: string;
  about_email: string;

  // About App Section
  about_lib_title: string;
  about_lib_points: string[];

  // Onboarding screens customization
  onboarding_step1_badge: string;
  onboarding_step1_title: string;
  onboarding_step1_desc: string;

  onboarding_step2_badge: string;
  onboarding_step2_title: string;
  onboarding_step2_desc: string;

  onboarding_step3_badge: string;
  onboarding_step3_title: string;
  onboarding_step3_desc: string;

  // Additional customizable UI texts
  about_telegram_label?: string;
  about_whatsapp_label?: string;
  about_facebook_label?: string;
  about_youtube_label?: string;
  about_email_label?: string;
  about_code_badge_tooltip?: string;
  about_social_title?: string;
  about_social_desc?: string;

  // Onboarding controls
  onboarding_btn_skip?: string;
  onboarding_btn_prev?: string;
  onboarding_btn_start?: string;
  onboarding_btn_next?: string;

  // Player controls & titles
  player_title_prev?: string;
  player_title_next?: string;
  player_title_expand?: string;
  player_title_dismiss?: string;
  player_title_close?: string;
  player_now_playing?: string;
  player_audio_genre?: string;
  player_audio_genre_en?: string;
  player_tooltip_prev?: string;
  player_tooltip_rewind?: string;
  player_tooltip_forward?: string;
  player_tooltip_next?: string;
  player_speed_label?: string;
  player_speed_title?: string;
  player_speed_normal?: string;
  player_footer_note?: string;

  // Feed/Home list
  list_search_placeholder?: string;
  list_search_clear?: string;
  list_total_label?: string;
  list_no_results?: string;
  list_no_results_sub?: string;
  list_listened_label?: string;
  list_fav_remove_tooltip?: string;
  list_fav_add_tooltip?: string;

  // Toolbar
  toolbar_menu_tooltip?: string;
  toolbar_more_tooltip?: string;
  toolbar_quick_options?: string;
  toolbar_share_copy?: string;
  toolbar_telegram_channel?: string;
  toolbar_info?: string;

  // Offline banner & General errors
  app_offline_desc?: string;
  app_offline_badge?: string;
  app_error_title?: string;

  // Continue Row
  continue_badge_label?: string;
  continue_remaining_label?: string;
  continue_clear_tooltip?: string;
  continue_resume_btn?: string;

  // History Tab
  history_stats_title?: string;
  history_stats_mins?: string;
  history_stats_chapters?: string;
  history_heading?: string;
  history_clear_all_btn?: string;
  history_no_history?: string;
  history_no_history_sub?: string;
  history_play_tooltip?: string;
  history_delete_tooltip?: string;

  // Favorites Tab
  favorites_clear_all?: string;
  favorites_heading?: string;
  favorites_empty_title?: string;
  favorites_empty_desc?: string;
  favorites_empty_go_home?: string;
  favorites_search_placeholder?: string;
  scraped_images?: string[];
  sidebar_cover_url?: string;
  about_cover_url?: string;
  creator_avatar_url?: string;
}

