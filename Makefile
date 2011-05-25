PACKAGE   = package
VERSION   = ` date +"%Y.%m%d" `
ARCHIVE   = $(PACKAGE)-$(VERSION)

# Ideally RELEASEDIR will be the name of the config
OUTPUT := development
RELEASEDIR = ./output/$(OUTPUT)
TMPDIR = /tmp

all: $(RELEASEDIR) $(RELEASEDIR)/client scripts css $(RELEASEDIR)/server $(RELEASEDIR)/config $(RELEASEDIR)/config/$(OUTPUT)/index.js 

$(RELEASEDIR)/server: $(RELEASEDIR)
	mkdir $@
	cp -R server $(RELEASEDIR) 

$(RELEASEDIR)/client: $(RELEASEDIR) client/humans.txt client/dev.html client/favicon.ico
	mkdir $@
	cp client/humans.txt $@	
	cp client/dev.html $@	
	cp client/favicon.ico $@	

$(RELEASEDIR)/config: $(RELEASEDIR) 
	mkdir $@ 

$(RELEASEDIR)/config/$(OUTPUT)/index.js: 
	mkdir -p $(@D)
	cp config/$(OUTPUT)/index.js $@ 

$(RELEASEDIR)/client/lib: 
	mkdir $@

libs: $(RELEASEDIR)/client/lib/formfactor.js\
      $(RELEASEDIR)/client/lib/routes.js\

$(RELEASEDIR)/client/lib/formfactor.js: client/lib/formfactor.js 
	uglifyjs client/lib/formfactor.js > $@

$(RELEASEDIR)/client/lib/routes.js: client/lib/routes.js 
	uglifyjs client/lib/routes.js  > $@

scripts: $(RELEASEDIR)/client/scripts/controller.js\
			   $(RELEASEDIR)/client/scripts/uis.js\
				 $(RELEASEDIR)/client/scripts/desktop\
				 $(RELEASEDIR)/client/scripts/phone\
				 $(RELEASEDIR)/client/scripts/tv\
				 $(RELEASEDIR)/client/scripts/tablet\
		   	 $(RELEASEDIR)/client/scripts\
	       $(RELEASEDIR)/client


$(RELEASEDIR)/client/scripts/controller.js: $(RELEASEDIR)/client/scripts
	uglifyjs client/scripts/controller.js > $@

$(RELEASEDIR)/client/scripts/uis.js: $(RELEASEDIR)/client/scripts
	uglifyjs client/scripts/uis.js > $@

$(RELEASEDIR)/client/scripts/desktop: $(RELEASEDIR)/client/scripts
	mkdir $@
	uglifyjs client/scripts/desktop/controller.js > $@/controller.js

$(RELEASEDIR)/client/scripts/tv: $(RELEASEDIR)/client/scripts
	mkdir $@
	uglifyjs client/scripts/tv/controller.js > $@/controller.js

$(RELEASEDIR)/client/scripts/tablet: $(RELEASEDIR)/client/scripts
	mkdir $@
	uglifyjs client/scripts/tablet/controller.js > $@/controller.js
	uglifyjs client/scripts/tablet/css-beziers.js > $@/css-beziers.js
	uglifyjs client/scripts/tablet/jquery.touch.tablet.js > $@/jquery.touch.tablet.js
	uglifyjs client/scripts/tablet/touchscroll.js > $@/touchscroll.js

$(RELEASEDIR)/client/scripts/phone: $(RELEASEDIR)/client/scripts
	mkdir $@
	uglifyjs client/scripts/phone/controller.js > $@/controller.js
	uglifyjs client/scripts/phone/jquery.touch.js > $@/jquery.touch.js

css: $(RELEASEDIR)/client/css/reset.css\
	   $(RELEASEDIR)/client/css/desktop.css\
		 $(RELEASEDIR)/client/css/phone.css\
		 $(RELEASEDIR)/client/css/tv.css\
		 $(RELEASEDIR)/client/css/tablet.css\
	   $(RELEASEDIR)/client/css

$(RELEASEDIR)/client/css/reset.css: $(RELEASEDIR)/client/css client/css/reset.css
	cp client/css/reset.css $@

$(RELEASEDIR)/client/css/desktop.css: $(RELEASEDIR)/client/css
	cat client/css/base.less client/css/desktop/*.less > $(TMPDIR)/$(@F)
	node build/less/lessc $(TMPDIR)/$(@F) > $@

$(RELEASEDIR)/client/css/phone.css: $(RELEASEDIR)/client/css
	cat client/css/base.less client/css/phone/*.less > $(TMPDIR)/$(@F)
	node build/less/lessc $(TMPDIR)/$(@F) > $@

$(RELEASEDIR)/client/css/tablet.css: $(RELEASEDIR)/client/css
	cat client/css/base.less client/css/tablet/*.less > $(TMPDIR)/$(@F)
	node build/less/lessc $(TMPDIR)/$(@F) > $@

$(RELEASEDIR)/client/css/tv.css: $(RELEASEDIR)/client/css
	cat client/css/base.less client/css/tv/*.less > $(TMPDIR)/$(@F)
	node build/less/lessc $(TMPDIR)/$(@F) > $@

$(RELEASEDIR)/client/scripts: $(RELEASEDIR)/client 
	mkdir $@

$(RELEASEDIR)/client/css: $(RELEASEDIR)/client 
	mkdir $@

$(RELEASEDIR):
	mkdir -p $(RELEASEDIR)

dist: all
	tar -zcf $(ARCHIVE).tar $(RELEASEDIR)	

clean:
	rm -rf ./output/*
	rmdir ./output
