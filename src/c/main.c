#include <pebble.h>

//APP_LOG(APP_LOG_LEVEL_DEBUG, "LOG MESSAGE");

// window layers
static Window *main_window;
static Layer *canvas_layer;
static TextLayer *logo_layer;
static TextLayer *day_layer;
static TextLayer *hour_layer;
static TextLayer *mins_layer;
static TextLayer *date_layer;
static TextLayer *month_layer;
static TextLayer *year_layer;
static TextLayer *weather_layer;
static TextLayer *temperature_layer;

// battery level
static int battery_level;
static Layer *battery_layer;
static TextLayer *battery_percentage;

// bluetooth icon
static BitmapLayer *bt_icon_layer;
static GBitmap *bt_icon_bitmap;

// saved settings
uint32_t hour_setting   = 0;
uint32_t date_setting   = 1;
uint32_t degree_setting = 2;
uint32_t logo_setting   = 3;
bool hour_bool;
bool date_bool;
bool degree_bool;
bool logo_bool;

// load date/time
static char hour12_buffer[3];
static char hour24_buffer[3];
static char datedd_buffer[3];
static char datemm_buffer[3];
static char monthmm_buffer[3];
static char monthdd_buffer[3];

// load weather
static char location_buffer[13];
static char weather_buffer[11];
static char temp_cel_buffer[5];
static char temp_fah_buffer[6];

// load options
static void load_options() {
  // load 24 or 12 hours
  if (persist_exists(hour_setting)) {
    char hour_buffer[5];
    persist_read_string(hour_setting, hour_buffer, sizeof(hour_buffer));
    if (strcmp(hour_buffer, "true") == 0) {
      hour_bool = true;
      text_layer_set_text(hour_layer, hour12_buffer);
    } else {
      hour_bool = false;
      text_layer_set_text(hour_layer, hour24_buffer);
    }
  } else {
    hour_bool = false;
  }

  // load date order
  if (persist_exists(date_setting)) {
    char date_buffer[5];
    persist_read_string(date_setting, date_buffer, sizeof(date_buffer));
    if (strcmp(date_buffer, "true") == 0) {
      date_bool = true;
      text_layer_set_text(date_layer,  datemm_buffer);
      text_layer_set_text(month_layer, monthdd_buffer);
    } else {
      date_bool = false;
      text_layer_set_text(date_layer,  datedd_buffer);
      text_layer_set_text(month_layer, monthmm_buffer);
    }
  } else {
    date_bool = false;
  }

  // load fahrenheit or celsius
  if (persist_exists(degree_setting)) {
    char degree_buffer[5];
    persist_read_string(degree_setting, degree_buffer, sizeof(degree_buffer));
    if (strcmp(degree_buffer, "true") == 0) {
      degree_bool = true;
      if (strlen(temp_cel_buffer) != 0 ) {
        text_layer_set_text(temperature_layer, temp_cel_buffer);
      }
    } else {
      degree_bool = false;
      if (strlen(temp_fah_buffer) != 0 ) {
        text_layer_set_text(temperature_layer, temp_fah_buffer);
      }
    }
  } else {
    degree_bool = false;
  }

  // load location or logo
  if (persist_exists(logo_setting)) {
    char logo_buffer[5];
    persist_read_string(logo_setting, logo_buffer, sizeof(logo_buffer));
    if (strcmp(logo_buffer, "true") == 0) {
      logo_bool = true;
      text_layer_set_text(logo_layer, "pebble");
    } else {
      logo_bool = false;
      if (strlen(location_buffer) != 0 ) {
        text_layer_set_text(logo_layer, location_buffer);
      } 
    }
  } else {
    logo_bool = false;
  }
}

// update options/weather
static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // collect options
  Tuple *hour_tuple   = dict_find(iterator, MESSAGE_KEY_HOUR);
  Tuple *date_tuple   = dict_find(iterator, MESSAGE_KEY_DATE);
  Tuple *degree_tuple = dict_find(iterator, MESSAGE_KEY_DEGREE);
  Tuple *logo_tuple   = dict_find(iterator, MESSAGE_KEY_LOGO);

  // save options
  if(hour_tuple && date_tuple && degree_tuple && logo_tuple) {
    char *hour_string   = hour_tuple->value->cstring;
    char *date_string   = date_tuple->value->cstring;
    char *degree_string = degree_tuple->value->cstring;
    char *logo_string   = logo_tuple->value->cstring;
    persist_write_string(hour_setting,   hour_string);
    persist_write_string(date_setting,   date_string);
    persist_write_string(degree_setting, degree_string);
    persist_write_string(logo_setting,   logo_string);
    load_options();
  }

  // collect weather
  Tuple *location_tuple = dict_find(iterator, MESSAGE_KEY_LOCATION);
  Tuple *weather_tuple  = dict_find(iterator, MESSAGE_KEY_WEATHER);
  Tuple *temp_cel_tuple = dict_find(iterator, MESSAGE_KEY_TEMP_CEL);
  Tuple *temp_fah_tuple = dict_find(iterator, MESSAGE_KEY_TEMP_FAH);

  // display location
  if (location_tuple) {
    snprintf(location_buffer, sizeof(location_buffer), "%s", location_tuple->value->cstring);
    if (!logo_bool) {
      text_layer_set_text(logo_layer, location_buffer);
    }
  }
  // display weather
  if (weather_tuple) {
    snprintf(weather_buffer, sizeof(weather_buffer), "%s", weather_tuple->value->cstring);
    text_layer_set_text(weather_layer, weather_buffer);
  }

  // display temperature
  if (temp_cel_tuple && temp_fah_tuple) {
    snprintf(temp_fah_buffer, sizeof(temp_fah_buffer), "%d°", (int)temp_fah_tuple->value->int32);
    snprintf(temp_cel_buffer, sizeof(temp_cel_buffer), "%d°", (int)temp_cel_tuple->value->int32);
    if (!degree_bool) {
      text_layer_set_text(temperature_layer, temp_fah_buffer);
    } else {
      text_layer_set_text(temperature_layer, temp_cel_buffer);
    } 
  }
}

// bluetooth connection change
static void bluetooth_callback(bool connected) {
  layer_set_hidden(bitmap_layer_get_layer(bt_icon_layer), connected);
  if(!connected) {
    vibes_double_pulse();
  }
}

// collect battery level
static void battery_callback(BatteryChargeState state) {
  battery_level = state.charge_percent;
  layer_mark_dirty(battery_layer);
}

// draw battery level
static void battery_update_proc(Layer *layer, GContext *ctx) {
  // get canvas size
  GRect bounds = layer_get_bounds(layer);
  int my = bounds.size.h;
  int cx = bounds.size.w/2;
  int cy = bounds.size.h/2;
  
  // collect battery level
  static char battery_buffer[5];
  snprintf(battery_buffer, sizeof(battery_buffer), "%d%%", (int8_t)battery_level);

  // display battery percentage
  battery_percentage = text_layer_create(GRect(cx+35,cy-52,30,my));
  text_layer_set_background_color(battery_percentage, GColorClear);
  text_layer_set_text_alignment(battery_percentage, GTextAlignmentCenter);
  text_layer_set_font(battery_percentage, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD));
  text_layer_set_text(battery_percentage, battery_buffer);
  layer_add_child(layer, text_layer_get_layer(battery_percentage));
}

// update date/time
static void update_datetime() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  
  // save date/time
  static char mins_buffer[3];
  static char day_buffer[10];
  static char year_buffer[5];
  
  // define date/time
  strftime(mins_buffer,    sizeof(mins_buffer),    "%M", tick_time);
  strftime(hour24_buffer,  sizeof(hour24_buffer),  "%H", tick_time);
  strftime(hour12_buffer,  sizeof(hour12_buffer),  "%I", tick_time);
  strftime(day_buffer,     sizeof(day_buffer),     "%A", tick_time);
  strftime(datedd_buffer,  sizeof(datedd_buffer),  "%d", tick_time);
  strftime(datemm_buffer,  sizeof(datemm_buffer),  "%m", tick_time);
  strftime(monthmm_buffer, sizeof(monthmm_buffer), "%m", tick_time);
  strftime(monthdd_buffer, sizeof(monthdd_buffer), "%d", tick_time);
  strftime(year_buffer,    sizeof(year_buffer),    "%Y", tick_time);

  // display time
  text_layer_set_text(mins_layer, mins_buffer);
  if (!hour_bool) {
    text_layer_set_text(hour_layer, hour24_buffer);
  } else {
    text_layer_set_text(hour_layer, hour12_buffer);
  }

  // display date
  text_layer_set_text(day_layer,  day_buffer);
  if (!date_bool) {
    text_layer_set_text(date_layer,  datedd_buffer);
    text_layer_set_text(month_layer, monthmm_buffer);
  } else {
    text_layer_set_text(date_layer,  datemm_buffer);
    text_layer_set_text(month_layer, monthdd_buffer);
  }
  text_layer_set_text(year_layer, year_buffer);
}
static void mins_tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_datetime();
}

// drawing canvas
static void canvas_update_proc(Layer *layer, GContext *ctx) {
  // get canvas size
  GRect bounds = layer_get_bounds(layer);
  int mx = bounds.size.w;
  int cx = bounds.size.w/2;
  int cy = bounds.size.h/2;
  
  // set colours
  graphics_context_set_stroke_color(ctx, GColorBlack);
  graphics_context_set_fill_color(ctx, GColorWhite);
 
  // draw boxes
  GRect logo_square = GRect(cx-65,cy-78,130,18);
  GRect day_square  = GRect(cx-65,cy-55,88, 25);
  GRect batt_header = GRect(cx+30,cy-50,10, 15);
  GRect batt_square = GRect(cx+35,cy-55,30, 25);
  GRect hour_square = GRect(cx-65,cy-20,60, 45);
  GRect mins_square = GRect(cx +5,cy-20,60, 45);
  GRect date_square = GRect(cx-65,cy+30,30, 25);
  GRect mnth_square = GRect(cx-25,cy+30,30, 25);
  GRect year_square = GRect(cx+15,cy+30,50, 25);
  GRect weat_square = GRect(cx-65,cy+60,85, 18);
  GRect temp_square = GRect(cx+30,cy+60,35, 18);
  graphics_draw_rect(ctx, logo_square);
  graphics_draw_rect(ctx, day_square);
  graphics_draw_rect(ctx, batt_header);
  graphics_draw_rect(ctx, batt_square);
  graphics_draw_rect(ctx, hour_square);
  graphics_draw_rect(ctx, mins_square);
  graphics_draw_rect(ctx, date_square);
  graphics_draw_rect(ctx, mnth_square);
  graphics_draw_rect(ctx, year_square);
  graphics_draw_rect(ctx, weat_square);
  graphics_draw_rect(ctx, temp_square);
  graphics_fill_rect(ctx, logo_square, 0, GCornersAll);
  graphics_fill_rect(ctx, day_square,  1, GCornersAll);
  graphics_fill_rect(ctx, batt_header, 1, GCornersAll);
  graphics_fill_rect(ctx, batt_square, 1, GCornersAll);
  graphics_fill_rect(ctx, hour_square, 2, GCornersAll);
  graphics_fill_rect(ctx, mins_square, 2, GCornersAll);
  graphics_fill_rect(ctx, date_square, 1, GCornersAll);
  graphics_fill_rect(ctx, mnth_square, 1, GCornersAll);
  graphics_fill_rect(ctx, year_square, 1, GCornersAll);
  graphics_fill_rect(ctx, weat_square, 0, GCornersAll);
  graphics_fill_rect(ctx, temp_square, 0, GCornersAll);

  // draw dots
  graphics_context_set_fill_color(ctx, GColorBlack);
  graphics_fill_circle(ctx, GPoint(cx-58,cy-69), 4);
  graphics_fill_circle(ctx, GPoint(cx+58,cy-69), 4);

  // draw calendar  
  GRect hour_inside = GRect(cx-58,cy-10,46,30);
  GRect mins_inside = GRect(cx+12,cy-10,46,30);
  graphics_draw_rect(ctx, hour_inside);
  graphics_draw_rect(ctx, mins_inside);
  graphics_fill_rect(ctx, hour_inside, 1, GCornersAll);
  graphics_fill_rect(ctx, mins_inside, 1, GCornersAll);
  
  // draw nubs
  GRect hour_nubone = GRect(cx-55,cy-25,10,12);
  GRect hour_nubtwo = GRect(cx-25,cy-25,10,12);
  GRect mins_nubone = GRect(cx+15,cy-25,10,12);
  GRect mins_nubtwo = GRect(cx+45,cy-25,10,12);
  graphics_draw_rect(ctx, hour_nubone);
  graphics_draw_rect(ctx, hour_nubtwo);
  graphics_draw_rect(ctx, mins_nubone);
  graphics_draw_rect(ctx, mins_nubtwo);
  graphics_fill_rect(ctx, hour_nubone, 1, GCornersAll);
  graphics_fill_rect(ctx, hour_nubtwo, 1, GCornersAll);
  graphics_fill_rect(ctx, mins_nubone, 1, GCornersAll);
  graphics_fill_rect(ctx, mins_nubtwo, 1, GCornersAll);

  // draw nubs inside
  graphics_context_set_fill_color(ctx, GColorWhite);
  GRect hour_nubin1 = GRect(cx-53,cy-25,6,10);
  GRect hour_nubin2 = GRect(cx-23,cy-25,6,10);
  GRect mins_nubin1 = GRect(cx+17,cy-25,6,10);
  GRect mins_nubin2 = GRect(cx+47,cy-25,6,10);
  graphics_draw_rect(ctx, hour_nubin1);
  graphics_draw_rect(ctx, hour_nubin2);
  graphics_draw_rect(ctx, mins_nubin1);
  graphics_draw_rect(ctx, mins_nubin2);
  graphics_fill_rect(ctx, hour_nubin1, 0, GCornersAll);
  graphics_fill_rect(ctx, hour_nubin2, 0, GCornersAll);
  graphics_fill_rect(ctx, mins_nubin1, 0, GCornersAll);
  graphics_fill_rect(ctx, mins_nubin2, 0, GCornersAll);

  // draw lines
  graphics_context_set_stroke_width(ctx, 1);
  graphics_draw_line(ctx, GPoint(0,cy+42), GPoint(mx,cy+42));
}

// window load
static void main_window_load(Window *window) {
  // collect window size
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  int mx = bounds.size.w;
  int my = bounds.size.h;
  int cx = bounds.size.w/2;
  int cy = bounds.size.h/2;
  
  // drawing canvas
  canvas_layer = layer_create(bounds);
  layer_set_update_proc(canvas_layer, canvas_update_proc);
  layer_add_child(window_get_root_layer(window), canvas_layer);

  // logo/location layer
  logo_layer = text_layer_create(GRect(0,cy-82,mx,my));
  text_layer_set_background_color(logo_layer, GColorClear);
  text_layer_set_text_alignment(logo_layer, GTextAlignmentCenter);
  text_layer_set_font(logo_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_text(logo_layer, "pebble");
  layer_add_child(window_layer, text_layer_get_layer(logo_layer));
  
  // battery layer
  battery_layer = layer_create(bounds);
  layer_set_update_proc(battery_layer, battery_update_proc);
  layer_add_child(window_get_root_layer(window), battery_layer);
  battery_callback(battery_state_service_peek());

  // time layers
  hour_layer = text_layer_create(GRect(cx-50,cy-13,mx,my));
  mins_layer = text_layer_create(GRect(cx+20,cy-13,mx,my));
  text_layer_set_background_color(hour_layer, GColorClear);
  text_layer_set_background_color(mins_layer, GColorClear);
  text_layer_set_text_color(hour_layer, GColorWhite);
  text_layer_set_text_color(mins_layer, GColorWhite);
  text_layer_set_font(hour_layer, fonts_get_system_font(FONT_KEY_DROID_SERIF_28_BOLD));
  text_layer_set_font(mins_layer, fonts_get_system_font(FONT_KEY_DROID_SERIF_28_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(hour_layer));
  layer_add_child(window_layer, text_layer_get_layer(mins_layer));

  // date layers
  day_layer   = text_layer_create(GRect(cx-65,cy-60,88,my));
  date_layer  = text_layer_create(GRect(cx-60,cy+26,mx,my));
  month_layer = text_layer_create(GRect(cx-20,cy+26,mx,my));
  year_layer  = text_layer_create(GRect(cx+20,cy+26,mx,my));
  text_layer_set_background_color(day_layer,   GColorClear);
  text_layer_set_background_color(date_layer,  GColorClear);
  text_layer_set_background_color(month_layer, GColorClear);
  text_layer_set_background_color(year_layer,  GColorClear);
  text_layer_set_text_alignment(day_layer, GTextAlignmentCenter);
  text_layer_set_font(day_layer,   fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_font(date_layer,  fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_font(month_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_font(year_layer,  fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(day_layer));
  layer_add_child(window_layer, text_layer_get_layer(date_layer));
  layer_add_child(window_layer, text_layer_get_layer(month_layer));
  layer_add_child(window_layer, text_layer_get_layer(year_layer));
  
  // weather layers
  weather_layer = text_layer_create(GRect(cx-64,cy+56,85,my));
  temperature_layer = text_layer_create(GRect(cx+31,cy+57,35,my));
  text_layer_set_background_color(weather_layer, GColorClear);
  text_layer_set_background_color(temperature_layer, GColorClear);
  text_layer_set_text_alignment(weather_layer, GTextAlignmentCenter);
  text_layer_set_text_alignment(temperature_layer, GTextAlignmentCenter);
  text_layer_set_font(weather_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_font(temperature_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_text(weather_layer, "Weather");
  text_layer_set_text(temperature_layer, "?°");
  layer_add_child(window_layer, text_layer_get_layer(weather_layer));
  layer_add_child(window_layer, text_layer_get_layer(temperature_layer));
  
  // Bluetooth Layer
  bt_icon_bitmap = gbitmap_create_with_resource(RESOURCE_ID_BT_ICON);
  bt_icon_layer = bitmap_layer_create(GRect(cx+30,cy+60,35,18));
  bitmap_layer_set_bitmap(bt_icon_layer, bt_icon_bitmap);
  layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(bt_icon_layer));
  bluetooth_callback(connection_service_peek_pebble_app_connection());
}

// window unload
static void main_window_unload(Window *window) {
  // destroy image layers
  gbitmap_destroy(bt_icon_bitmap);
  bitmap_layer_destroy(bt_icon_layer);
  // destroy text layers
  text_layer_destroy(temperature_layer);
  text_layer_destroy(weather_layer);
  text_layer_destroy(year_layer);
  text_layer_destroy(month_layer);
  text_layer_destroy(date_layer);
  text_layer_destroy(mins_layer);
  text_layer_destroy(hour_layer);
  text_layer_destroy(battery_percentage);
  text_layer_destroy(day_layer);
  text_layer_destroy(logo_layer);
  // destroy canvas layers
  layer_destroy(battery_layer);
  layer_destroy(canvas_layer);
}

// init
static void init() {
  // create window
  main_window = window_create();
  window_set_background_color(main_window, GColorBlack);

  // load/unload window
  window_set_window_handlers(main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });
  
  // send window to screen
  window_stack_push(main_window, true);
  
  // load options
  load_options();
  
  // update date/time
  update_datetime();
  tick_timer_service_subscribe(MINUTE_UNIT, mins_tick_handler);
  
  // update battery level
  battery_state_service_subscribe(battery_callback);
  
  // check bluetooth connection
  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = bluetooth_callback
  });

  // update options/weather
  app_message_register_inbox_received(inbox_received_callback);
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

// deinit
static void deinit() {
  window_destroy(main_window);
}

// main
int main(void) {
  init();
  app_event_loop();
  deinit();
}