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

.PHONY: all clean watch

all: $(css_out) $(js_out) $(html_out)

$(css_out_dir):
	mkdir -p public/css

$(css_out): $(css_out_dir) $(css_deps)
	node-sass $(css_src) $@

$(js_out_dir):
	mkdir -p public/js

$(js_out): $(js_out_dir) $(js_deps)
	browserify --standalone app $(js_src) -o $@

$(html_out): $(html_src)
	cp $< $@

watch:
	watch make client

clean:
	rm -rf public
