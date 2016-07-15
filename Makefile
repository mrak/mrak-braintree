PATH := node_modules/.bin:$(PATH)

js_src_dir := client/js
js_src := $(js_src_dir)/index.js
js_out_dir := public/js
js_out := $(js_out_dir)/scripts.js
js_deps := $(wildcard $(js_src_dir)/*.js $(js_src_dir)/**/*.js)

css_out_dir := public/css
css_out := $(css_out_dir)/styles.css
css_src_dir := client/scss
css_src := $(css_src_dir)/styles.scss
css_deps := $(wildcard $(css_src_dir)/*.scss $(css_src_dir)/**/*.scss)

html_src := client/index.html
html_out := public/index.html

node-sass := node-sass --output-style compressed

.PHONY: all clean watch watch-js watch-css

all: $(css_out) $(js_out) $(html_out)

$(css_out_dir):
	mkdir -p public/css

$(css_out): $(css_out_dir) $(css_deps)
	$(node-sass) $(css_src) $@

$(js_out_dir):
	mkdir -p public/js

$(js_out): $(js_out_dir) $(js_deps)
	browserify --standalone App $(js_src) -o $@

$(html_out): $(html_src)
	cp $< $@

watch-css: $(css_out)
	$(node-sass) -wr $(css_src) $(css_out)

watch-js: $(js_out_dir)
	watchify -v --standalone App $(js_src) -o $(js_out)

start:
	node server.js

watch: watch-css watch-js start $(html_out)

clean:
	rm -rf public
